/**
 * Tests des routes /api/pari
 * Jest + Supertest — les modèles Mongoose sont mockés (pas de vraie base de données)
 */

const request = require('supertest');
const mongoose = require('mongoose');

// ─── MOCKS ────────────────────────────────────────────────────────────────────

// Empêche Mongoose de se connecter à MongoDB pendant les tests
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

// IDs MongoDB valides pour les tests
const USER_ID  = new mongoose.Types.ObjectId().toString();
const ADMIN_ID = new mongoose.Types.ObjectId().toString();
const BET_ID   = new mongoose.Types.ObjectId().toString();
const MATCH_ID = new mongoose.Types.ObjectId().toString();
const TEAM1_ID = new mongoose.Types.ObjectId().toString();
const TEAM2_ID = new mongoose.Types.ObjectId().toString();

jest.mock('../models/User',  () => ({ findById: jest.fn() }));
jest.mock('../models/Match', () => ({ findById: jest.fn() }));
jest.mock('../models/Bet', () => {
  const mockSave = jest.fn().mockResolvedValue(true);
  const BetMock  = jest.fn().mockImplementation((data) => ({ ...data, save: mockSave }));
  BetMock.find             = jest.fn();
  BetMock.findById         = jest.fn();
  BetMock.findOne          = jest.fn();
  BetMock.findByIdAndDelete = jest.fn();
  return BetMock;
});
jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn(), generateToken: jest.fn() }));

// ─── IMPORTS ──────────────────────────────────────────────────────────────────

const app   = require('../app');
const jwt   = require('../utils/jwt');
const User  = require('../models/User');
const Match = require('../models/Match');
const Bet   = require('../models/Bet');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Crée un faux objet "query Mongoose" qui peut être utilisé de deux façons :
 *   - await User.findById(id)           → résout fakeUser
 *   - await User.findById(id).select()  → résout fakeUser
 * Sans ça, le middleware (qui utilise .select) et le contrôleur (qui n'en a pas besoin)
 * seraient incompatibles avec un simple mockResolvedValue.
 */
function makeFakeQuery(value) {
  const p = Promise.resolve(value);
  return {
    select: jest.fn().mockResolvedValue(value),
    then:   (...args) => p.then(...args),
    catch:  (...args) => p.catch(...args),
  };
}

function mockUserAuth(userId = USER_ID, role = 'user', points = 500) {
  jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId, role } });

  const fakeUser = {
    _id: userId,
    username: 'testuser',
    email: 'test@test.com',
    role,
    points,
    save: jest.fn().mockResolvedValue(true),
  };

  // Par défaut : toujours retourner le même fakeUser (middleware + contrôleur)
  User.findById.mockReturnValue(makeFakeQuery(fakeUser));
}

function mockAdminAuth() {
  mockUserAuth(ADMIN_ID, 'admin', 9999);
}

const VALID_TOKEN = 'Bearer fake.jwt.token';

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('Routes /api/pari (Bets)', () => {

  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════════════════════════
  // GET /api/pari
  // ══════════════════════════════════════════════════════════════════════════

  describe('GET /api/pari', () => {

    it('200 — utilisateur voit ses propres paris', async () => {
      mockUserAuth();
      Bet.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([{ _id: BET_ID, amount: 100 }]),
      });

      const res = await request(app).get('/api/pari').set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bets');
      expect(res.body.count).toBe(1);
    });

    it('401 — pas de token', async () => {
      const res = await request(app).get('/api/pari');
      expect(res.status).toBe(401);
    });

    it('401 — token invalide', async () => {
      jwt.verifyToken.mockReturnValue({ valid: false, error: 'jwt malformed' });

      const res = await request(app)
        .get('/api/pari')
        .set('Authorization', 'Bearer token.invalide');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Token invalide');
    });

    it('Sécurité XSS — script dans le header ne plante pas le serveur', async () => {
      jwt.verifyToken.mockReturnValue({ valid: false, error: 'token invalide' });

      const res = await request(app)
        .get('/api/pari')
        .set('Authorization', 'Bearer <script>alert(1)</script>');

      expect(res.status).toBe(401);
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // GET /api/pari/:id
  // ══════════════════════════════════════════════════════════════════════════

  describe('GET /api/pari/:id', () => {

    it('200 — le propriétaire du pari peut le voir', async () => {
      mockUserAuth();

      const fakeBet = {
        _id: BET_ID,
        amount: 100,
        userId: { _id: { toString: () => USER_ID } },
      };
      Bet.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve(fakeBet).then(resolve),
        catch: (reject) => Promise.resolve(fakeBet).catch(reject),
      });

      const res = await request(app)
        .get(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
    });

    it('404 — pari inexistant', async () => {
      mockUserAuth();
      Bet.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve(null).then(resolve),
        catch: (reject) => Promise.resolve(null).catch(reject),
      });

      const res = await request(app)
        .get(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Pari introuvable');
    });

    it('403 — un autre utilisateur ne peut pas voir le pari', async () => {
      const OTHER_ID = new mongoose.Types.ObjectId().toString();
      mockUserAuth(OTHER_ID, 'user');

      const fakeBet = {
        _id: BET_ID,
        amount: 100,
        userId: { _id: { toString: () => USER_ID } }, // appartient à USER_ID
      };
      Bet.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve(fakeBet).then(resolve),
        catch: (reject) => Promise.resolve(fakeBet).catch(reject),
      });

      const res = await request(app)
        .get(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Accès refusé');
    });

    it('401 — sans token', async () => {
      const res = await request(app).get(`/api/pari/${BET_ID}`);
      expect(res.status).toBe(401);
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // POST /api/pari
  // ══════════════════════════════════════════════════════════════════════════

  describe('POST /api/pari', () => {

    const validBody = {
      matchId: MATCH_ID,
      predictedWinnerId: TEAM1_ID,
      amount: 100,
      odds: 1.5,
    };

    it('201 — pari créé avec succès', async () => {
      mockUserAuth();

      Match.findById.mockResolvedValue({
        _id: MATCH_ID,
        status: 'scheduled',
        team1Id: { toString: () => TEAM1_ID },
        team2Id: { toString: () => TEAM2_ID },
      });

      // Le contrôleur appelle User.findById une 2e fois (pour vérifier les points)
      // On surcharge pour ce test avec mockReturnValueOnce x2
      const fakeUserForMiddleware = {
        _id: USER_ID, username: 'testuser', email: 'test@test.com',
        role: 'user', points: 500, save: jest.fn().mockResolvedValue(true),
      };
      const fakeUserForController = {
        _id: USER_ID, points: 500, save: jest.fn().mockResolvedValue(true),
      };
      User.findById
        .mockReturnValueOnce(makeFakeQuery(fakeUserForMiddleware))
        .mockResolvedValueOnce(fakeUserForController);

      Bet.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/pari')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Pari placé avec succès');
    });

    it('401 — sans token', async () => {
      const res = await request(app).post('/api/pari').send(validBody);
      expect(res.status).toBe(401);
    });

    it('404 — match inexistant', async () => {
      mockUserAuth();
      Match.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/pari')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Match introuvable');
    });

    it('400 — match terminé, paris fermés', async () => {
      mockUserAuth();
      Match.findById.mockResolvedValue({
        _id: MATCH_ID, status: 'finished',
        team1Id: { toString: () => TEAM1_ID },
        team2Id: { toString: () => TEAM2_ID },
      });

      const res = await request(app)
        .post('/api/pari')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Paris fermés');
    });

    it('400 — équipe prédite ne joue pas dans ce match', async () => {
      mockUserAuth();
      const WRONG_TEAM = new mongoose.Types.ObjectId().toString();
      Match.findById.mockResolvedValue({
        _id: MATCH_ID, status: 'scheduled',
        team1Id: { toString: () => TEAM1_ID },
        team2Id: { toString: () => TEAM2_ID },
      });

      const res = await request(app)
        .post('/api/pari')
        .set('Authorization', VALID_TOKEN)
        .send({ ...validBody, predictedWinnerId: WRONG_TEAM });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Équipe invalide');
    });

    it('400 — points insuffisants', async () => {
      const fakeUserMiddleware = {
        _id: USER_ID, username: 'testuser', email: 'test@test.com',
        role: 'user', points: 50, save: jest.fn(),
      };
      const fakeUserController = { _id: USER_ID, points: 50, save: jest.fn() };

      jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId: USER_ID, role: 'user' } });
      User.findById
        .mockReturnValueOnce(makeFakeQuery(fakeUserMiddleware))
        .mockResolvedValueOnce(fakeUserController);

      Match.findById.mockResolvedValue({
        _id: MATCH_ID, status: 'scheduled',
        team1Id: { toString: () => TEAM1_ID },
        team2Id: { toString: () => TEAM2_ID },
      });

      const res = await request(app)
        .post('/api/pari')
        .set('Authorization', VALID_TOKEN)
        .send({ ...validBody, amount: 100 }); // 100 points avec seulement 50

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Points insuffisants');
    });

    it('400 — pari déjà existant sur ce match', async () => {
      const fakeUserMiddleware = {
        _id: USER_ID, username: 'testuser', email: 'test@test.com',
        role: 'user', points: 500, save: jest.fn(),
      };
      const fakeUserController = { _id: USER_ID, points: 500, save: jest.fn() };

      jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId: USER_ID, role: 'user' } });
      User.findById
        .mockReturnValueOnce(makeFakeQuery(fakeUserMiddleware))
        .mockResolvedValueOnce(fakeUserController);

      Match.findById.mockResolvedValue({
        _id: MATCH_ID, status: 'scheduled',
        team1Id: { toString: () => TEAM1_ID },
        team2Id: { toString: () => TEAM2_ID },
      });
      Bet.findOne.mockResolvedValue({ _id: BET_ID }); // pari déjà présent

      const res = await request(app)
        .post('/api/pari')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Pari existant');
    });

    it('Sécurité XSS — payload avec balises HTML refusé proprement', async () => {
      mockUserAuth();
      Match.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/pari')
        .set('Authorization', VALID_TOKEN)
        .send({
          matchId: '<script>alert("xss")</script>',
          predictedWinnerId: TEAM1_ID,
          amount: 100,
          odds: 1.5,
        });

      // Le serveur ne doit pas exposer de stack trace
      expect(res.body).not.toHaveProperty('stack');
      expect([400, 404, 500]).toContain(res.status);
    });

  });

  // ══════════════════════════════════════════════════════════════════════════
  // DELETE /api/pari/:id
  // ══════════════════════════════════════════════════════════════════════════

  describe('DELETE /api/pari/:id', () => {

    it('200 — annulation réussie par le propriétaire', async () => {
      const fakeUserMiddleware = {
        _id: USER_ID, username: 'testuser', email: 'test@test.com',
        role: 'user', points: 400, save: jest.fn().mockResolvedValue(true),
      };
      const fakeUserController = { _id: USER_ID, points: 400, save: jest.fn().mockResolvedValue(true) };

      jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId: USER_ID, role: 'user' } });
      User.findById
        .mockReturnValueOnce(makeFakeQuery(fakeUserMiddleware))
        .mockResolvedValueOnce(fakeUserController);

      const fakeBet = {
        _id: BET_ID, amount: 100,
        userId: { toString: () => USER_ID },
        matchId: { status: 'scheduled' },
      };
      Bet.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeBet) });
      Bet.findByIdAndDelete.mockResolvedValue(fakeBet);

      const res = await request(app)
        .delete(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Pari annulé avec succès');
    });

    it('401 — sans token', async () => {
      const res = await request(app).delete(`/api/pari/${BET_ID}`);
      expect(res.status).toBe(401);
    });

    it('404 — pari inexistant', async () => {
      mockUserAuth();
      Bet.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      const res = await request(app)
        .delete(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Pari introuvable');
    });

    it('403 — un autre utilisateur ne peut pas annuler le pari', async () => {
      const OTHER_ID = new mongoose.Types.ObjectId().toString();
      mockUserAuth(OTHER_ID, 'user');

      const fakeBet = {
        _id: BET_ID, amount: 100,
        userId: { toString: () => USER_ID }, // appartient à USER_ID
        matchId: { status: 'scheduled' },
      };
      Bet.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeBet) });

      const res = await request(app)
        .delete(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Accès refusé');
    });

    it('400 — annulation impossible (match déjà commencé)', async () => {
      mockUserAuth();

      const fakeBet = {
        _id: BET_ID, amount: 100,
        userId: { toString: () => USER_ID },
        matchId: { status: 'live' },
      };
      Bet.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeBet) });

      const res = await request(app)
        .delete(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Annulation impossible');
    });

    it("200 — un admin peut annuler le pari de quelqu'un d'autre", async () => {
      const fakeAdminMiddleware = {
        _id: ADMIN_ID, username: 'admin', email: 'admin@test.com',
        role: 'admin', points: 9999, save: jest.fn().mockResolvedValue(true),
      };
      const fakeAdminController = { _id: ADMIN_ID, points: 9999, save: jest.fn().mockResolvedValue(true) };

      jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId: ADMIN_ID, role: 'admin' } });
      User.findById
        .mockReturnValueOnce(makeFakeQuery(fakeAdminMiddleware))
        .mockResolvedValueOnce(fakeAdminController);

      const fakeBet = {
        _id: BET_ID, amount: 100,
        userId: { toString: () => USER_ID },
        matchId: { status: 'scheduled' },
      };
      Bet.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeBet) });
      Bet.findByIdAndDelete.mockResolvedValue(fakeBet);

      const res = await request(app)
        .delete(`/api/pari/${BET_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
    });

  });

});
