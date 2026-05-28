/**
 * Tests des routes /api/players
 * GET (public), POST/PUT/DELETE (admin uniquement)
 */

const request = require('supertest');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

const USER_ID   = new mongoose.Types.ObjectId().toString();
const ADMIN_ID  = new mongoose.Types.ObjectId().toString();
const PLAYER_ID = new mongoose.Types.ObjectId().toString();
const TEAM_ID   = new mongoose.Types.ObjectId().toString();

jest.mock('../models/User',   () => ({ findById: jest.fn() }));
jest.mock('../models/Team',   () => ({ findById: jest.fn() }));
jest.mock('../models/Player', () => {
  const mockSave  = jest.fn().mockResolvedValue(true);
  const PlayerMock = jest.fn().mockImplementation((data) => ({ ...data, save: mockSave }));
  PlayerMock.find              = jest.fn();
  PlayerMock.findById          = jest.fn();
  PlayerMock.findByIdAndUpdate = jest.fn();
  PlayerMock.findByIdAndDelete = jest.fn();
  return PlayerMock;
});
jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn(), generateToken: jest.fn() }));

const app    = require('../app');
const jwt    = require('../utils/jwt');
const User   = require('../models/User');
const Team   = require('../models/Team');
const Player = require('../models/Player');

function makeFakeQuery(value) {
  const p = Promise.resolve(value);
  return {
    select:   jest.fn().mockResolvedValue(value),
    populate: jest.fn().mockReturnThis(),
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
const fakePlayer  = { _id: PLAYER_ID, nickname: 's1mple', realName: 'Oleksandr', nationality: 'UA', teamId: TEAM_ID };

describe('Routes /api/players', () => {

  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════
  // GET /api/players  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/players', () => {

    it('200 — retourne tous les joueurs (sans token)', async () => {
      Player.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([fakePlayer]),
      });

      const res = await request(app).get('/api/players');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('players');
      expect(res.body.count).toBe(1);
    });

    it('200 — filtre par équipe', async () => {
      Player.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([fakePlayer]),
      });

      const res = await request(app).get(`/api/players?team_id=${TEAM_ID}`);
      expect(res.status).toBe(200);
    });

  });

  // ══════════════════════════════════════════════════════
  // GET /api/players/:id  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/players/:id', () => {

    it('200 — retourne un joueur par ID', async () => {
      Player.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakePlayer),
      });

      const res = await request(app).get(`/api/players/${PLAYER_ID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('player');
    });

    it('404 — joueur inexistant', async () => {
      Player.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get(`/api/players/${PLAYER_ID}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Joueur introuvable');
    });

  });

  // ══════════════════════════════════════════════════════
  // POST /api/players  — admin requis
  // ══════════════════════════════════════════════════════

  describe('POST /api/players', () => {

    const validBody = { nickname: 'ZywOo', realName: 'Mathieu', nationality: 'FR', teamId: TEAM_ID };

    it('201 — joueur créé par un admin', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue({ _id: TEAM_ID });

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Joueur créé avec succès');
    });

    it('401 — sans token', async () => {
      const res = await request(app).post('/api/players').send(validBody);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(403);
    });

    it('404 — équipe inexistante', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Équipe introuvable');
    });

    it('201 — joueur sans équipe (teamId absent)', async () => {
      mockAdminAuth();

      const res = await request(app)
        .post('/api/players')
        .set('Authorization', VALID_TOKEN)
        .send({ nickname: 'FreeAgent', realName: 'John', nationality: 'US' });

      expect(res.status).toBe(201);
    });

  });

  // ══════════════════════════════════════════════════════
  // PUT /api/players/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('PUT /api/players/:id', () => {

    it('200 — joueur modifié par un admin', async () => {
      mockAdminAuth();
      Player.findById.mockResolvedValue(fakePlayer);
      Player.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ ...fakePlayer, nickname: 's1mple_v2' }),
      });

      const res = await request(app)
        .put(`/api/players/${PLAYER_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ nickname: 's1mple_v2' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Joueur modifié avec succès');
    });

    it('404 — joueur inexistant', async () => {
      mockAdminAuth();
      Player.findById.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/players/${PLAYER_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ nickname: 'x' });

      expect(res.status).toBe(404);
    });

    it('404 — nouvelle équipe inexistante', async () => {
      mockAdminAuth();
      Player.findById.mockResolvedValue(fakePlayer);
      Team.findById.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/players/${PLAYER_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ teamId: new mongoose.Types.ObjectId().toString() });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Équipe introuvable');
    });

    it('401 — sans token', async () => {
      const res = await request(app).put(`/api/players/${PLAYER_ID}`).send({});
      expect(res.status).toBe(401);
    });

  });

  // ══════════════════════════════════════════════════════
  // DELETE /api/players/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('DELETE /api/players/:id', () => {

    it('200 — joueur supprimé par un admin', async () => {
      mockAdminAuth();
      Player.findById.mockResolvedValue(fakePlayer);
      Player.findByIdAndDelete.mockResolvedValue(fakePlayer);

      const res = await request(app)
        .delete(`/api/players/${PLAYER_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Joueur supprimé avec succès');
    });

    it('404 — joueur inexistant', async () => {
      mockAdminAuth();
      Player.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/players/${PLAYER_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).delete(`/api/players/${PLAYER_ID}`);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .delete(`/api/players/${PLAYER_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(403);
    });

  });

});
