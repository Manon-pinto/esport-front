/**
 * Tests des routes /api/matches
 * GET (public), POST/PUT/DELETE (admin uniquement)
 * Le PUT contient une logique métier importante : résolution des paris
 */

const request = require('supertest');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

const USER_ID       = new mongoose.Types.ObjectId().toString();
const ADMIN_ID      = new mongoose.Types.ObjectId().toString();
const MATCH_ID      = new mongoose.Types.ObjectId().toString();
const TOURNAMENT_ID = new mongoose.Types.ObjectId().toString();
const TEAM1_ID      = new mongoose.Types.ObjectId().toString();
const TEAM2_ID      = new mongoose.Types.ObjectId().toString();

jest.mock('../models/User',       () => ({ findById: jest.fn(), findByIdAndUpdate: jest.fn() }));
jest.mock('../models/Tournament', () => ({ findById: jest.fn() }));
jest.mock('../models/Team',       () => ({ findById: jest.fn() }));
jest.mock('../models/Bet',        () => ({ find: jest.fn() }));
jest.mock('../models/Match', () => {
  const mockSave  = jest.fn().mockResolvedValue(true);
  const MatchMock = jest.fn().mockImplementation((data) => ({ ...data, save: mockSave }));
  MatchMock.find              = jest.fn();
  MatchMock.findById          = jest.fn();
  MatchMock.findByIdAndUpdate = jest.fn();
  MatchMock.findByIdAndDelete = jest.fn();
  return MatchMock;
});
jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn(), generateToken: jest.fn() }));

const app        = require('../app');
const jwt        = require('../utils/jwt');
const User       = require('../models/User');
const Match      = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team       = require('../models/Team');
const Bet        = require('../models/Bet');

function makeFakeQuery(value) {
  const p = Promise.resolve(value);
  return {
    select:   jest.fn().mockResolvedValue(value),
    populate: jest.fn().mockReturnThis(),
    sort:     jest.fn().mockResolvedValue(Array.isArray(value) ? value : [value]),
    then:     (...args) => p.then(...args),
    catch:    (...args) => p.catch(...args),
  };
}

function mockAuth(userId = USER_ID, role = 'user') {
  jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId, role } });
  User.findById.mockReturnValue(makeFakeQuery({
    _id: userId, username: 'testuser', email: 'test@test.com', role, points: 500,
  }));
}
function mockAdminAuth() { mockAuth(ADMIN_ID, 'admin'); }

const VALID_TOKEN = 'Bearer fake.jwt.token';
const fakeMatch   = {
  _id: MATCH_ID, status: 'scheduled',
  team1Id: TEAM1_ID, team2Id: TEAM2_ID,
  tournamentId: TOURNAMENT_ID,
};

describe('Routes /api/matches', () => {

  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════
  // GET /api/matches  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/matches', () => {

    it('200 — retourne tous les matchs (sans token)', async () => {
      Match.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([fakeMatch]),
      });

      const res = await request(app).get('/api/matches');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('matches');
      expect(res.body.count).toBe(1);
    });

    it('200 — filtre par statut', async () => {
      Match.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([fakeMatch]),
      });

      const res = await request(app).get('/api/matches?status=scheduled');
      expect(res.status).toBe(200);
    });

  });

  // ══════════════════════════════════════════════════════
  // GET /api/matches/:id  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/matches/:id', () => {

    it('200 — retourne un match par ID', async () => {
      Match.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then:     (resolve) => Promise.resolve(fakeMatch).then(resolve),
        catch:    (reject)  => Promise.resolve(fakeMatch).catch(reject),
      });

      const res = await request(app).get(`/api/matches/${MATCH_ID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('match');
    });

    it('404 — match inexistant', async () => {
      Match.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then:     (resolve) => Promise.resolve(null).then(resolve),
        catch:    (reject)  => Promise.resolve(null).catch(reject),
      });

      const res = await request(app).get(`/api/matches/${MATCH_ID}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Match introuvable');
    });

  });

  // ══════════════════════════════════════════════════════
  // POST /api/matches  — admin requis
  // ══════════════════════════════════════════════════════

  describe('POST /api/matches', () => {

    const validBody = {
      tournamentId: TOURNAMENT_ID, team1Id: TEAM1_ID,
      team2Id: TEAM2_ID, scheduledAt: '2025-09-01T18:00:00Z', bestOf: 3,
    };

    it('201 — match créé par un admin', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue({ _id: TOURNAMENT_ID, name: 'ESL Pro League' });
      Team.findById
        .mockResolvedValueOnce({ _id: TEAM1_ID })
        .mockResolvedValueOnce({ _id: TEAM2_ID });

      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Match créé avec succès');
    });

    it('401 — sans token', async () => {
      const res = await request(app).post('/api/matches').send(validBody);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(403);
    });

    it('404 — tournoi inexistant', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Tournoi introuvable');
    });

    it('404 — une équipe inexistante', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue({ _id: TOURNAMENT_ID });
      Team.findById
        .mockResolvedValueOnce({ _id: TEAM1_ID })
        .mockResolvedValueOnce(null); // team2 introuvable

      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Une des équipes est introuvable');
    });

    it('400 — les deux équipes sont identiques', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue({ _id: TOURNAMENT_ID });
      Team.findById.mockResolvedValue({ _id: TEAM1_ID });

      const res = await request(app)
        .post('/api/matches')
        .set('Authorization', VALID_TOKEN)
        .send({ ...validBody, team1Id: TEAM1_ID, team2Id: TEAM1_ID });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Les deux équipes doivent être différentes');
    });

  });

  // ══════════════════════════════════════════════════════
  // PUT /api/matches/:id  — admin requis + logique paris
  // ══════════════════════════════════════════════════════

  describe('PUT /api/matches/:id', () => {

    it('200 — match modifié par un admin', async () => {
      mockAdminAuth();
      Match.findById.mockResolvedValue({ ...fakeMatch, status: 'scheduled' });
      Match.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then:     (resolve) => Promise.resolve({ ...fakeMatch, status: 'live' }).then(resolve),
        catch:    (reject)  => Promise.resolve().catch(reject),
      });
      Bet.find.mockResolvedValue([]);

      const res = await request(app)
        .put(`/api/matches/${MATCH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ status: 'live' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Match modifié avec succès');
    });

    it('200 — résolution automatique des paris quand le match est terminé', async () => {
      mockAdminAuth();
      Match.findById.mockResolvedValue({ ...fakeMatch, status: 'live' });
      Match.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve({ ...fakeMatch, status: 'completed', winnerId: TEAM1_ID }).then(resolve),
        catch: (reject) => Promise.resolve().catch(reject),
      });

      // Un pari gagnant et un pari perdant
      const fakeBets = [
        { predictedWinnerId: { toString: () => TEAM1_ID }, status: 'pending', potentialWin: 150, amount: 100, odds: 1.5, userId: USER_ID, save: jest.fn() },
        { predictedWinnerId: { toString: () => TEAM2_ID }, status: 'pending', potentialWin: 0,   amount: 50,  odds: 2.0, userId: USER_ID, save: jest.fn() },
      ];
      Bet.find.mockResolvedValue(fakeBets);
      User.findByIdAndUpdate.mockResolvedValue(true);

      const res = await request(app)
        .put(`/api/matches/${MATCH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ status: 'completed', winnerId: TEAM1_ID });

      expect(res.status).toBe(200);
      // Le pari gagnant doit avoir été mis à jour
      expect(fakeBets[0].save).toHaveBeenCalled();
      expect(fakeBets[0].status).toBe('won');
      expect(fakeBets[1].status).toBe('lost');
    });

    it('200 — remboursement des paris quand le match est annulé', async () => {
      mockAdminAuth();
      Match.findById.mockResolvedValue({ ...fakeMatch, status: 'scheduled' });
      Match.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => Promise.resolve({ ...fakeMatch, status: 'cancelled' }).then(resolve),
        catch: (reject) => Promise.resolve().catch(reject),
      });

      const pendingBet = { status: 'pending', amount: 100, userId: USER_ID, save: jest.fn() };
      Bet.find.mockResolvedValue([pendingBet]);
      User.findByIdAndUpdate.mockResolvedValue(true);

      const res = await request(app)
        .put(`/api/matches/${MATCH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ status: 'cancelled' });

      expect(res.status).toBe(200);
      expect(pendingBet.status).toBe('cancelled');
      expect(pendingBet.save).toHaveBeenCalled();
    });

    it('404 — match inexistant', async () => {
      mockAdminAuth();
      Match.findById.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/matches/${MATCH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ status: 'live' });

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).put(`/api/matches/${MATCH_ID}`).send({ status: 'live' });
      expect(res.status).toBe(401);
    });

  });

  // ══════════════════════════════════════════════════════
  // DELETE /api/matches/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('DELETE /api/matches/:id', () => {

    it('200 — match supprimé par un admin', async () => {
      mockAdminAuth();
      Match.findById.mockResolvedValue(fakeMatch);
      Match.findByIdAndDelete.mockResolvedValue(fakeMatch);

      const res = await request(app)
        .delete(`/api/matches/${MATCH_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Match supprimé avec succès');
    });

    it('404 — match inexistant', async () => {
      mockAdminAuth();
      Match.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/matches/${MATCH_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).delete(`/api/matches/${MATCH_ID}`);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .delete(`/api/matches/${MATCH_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(403);
    });

  });

});
