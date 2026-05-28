/**
 * Tests des routes /api/tournois
 * GET (public), POST/PUT/DELETE (admin uniquement)
 */

const request = require('supertest');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

const USER_ID       = new mongoose.Types.ObjectId().toString();
const ADMIN_ID      = new mongoose.Types.ObjectId().toString();
const TOURNAMENT_ID = new mongoose.Types.ObjectId().toString();

jest.mock('../models/User', () => ({ findById: jest.fn() }));
jest.mock('../models/Tournament', () => {
  const mockSave       = jest.fn().mockResolvedValue(true);
  const TournamentMock = jest.fn().mockImplementation((data) => ({ ...data, save: mockSave }));
  TournamentMock.find              = jest.fn();
  TournamentMock.findById          = jest.fn();
  TournamentMock.findByIdAndUpdate = jest.fn();
  TournamentMock.findByIdAndDelete = jest.fn();
  return TournamentMock;
});
jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn(), generateToken: jest.fn() }));

const app        = require('../app');
const jwt        = require('../utils/jwt');
const User       = require('../models/User');
const Tournament = require('../models/Tournament');

function makeFakeQuery(value) {
  const p = Promise.resolve(value);
  return {
    select: jest.fn().mockResolvedValue(value),
    then:   (...args) => p.then(...args),
    catch:  (...args) => p.catch(...args),
  };
}

function mockAuth(userId = USER_ID, role = 'user') {
  jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId, role } });
  User.findById.mockReturnValue(makeFakeQuery({
    _id: userId, username: 'testuser', email: 'test@test.com', role, points: 500,
  }));
}
function mockAdminAuth() { mockAuth(ADMIN_ID, 'admin'); }

const VALID_TOKEN    = 'Bearer fake.jwt.token';
const fakeTournament = { _id: TOURNAMENT_ID, name: 'ESL Pro League', game: 'CS2', status: 'upcoming' };

describe('Routes /api/tournois', () => {

  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════
  // GET /api/tournois  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/tournois', () => {

    it('200 — retourne tous les tournois (sans token)', async () => {
      Tournament.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([fakeTournament]),
      });

      const res = await request(app).get('/api/tournois');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tournaments');
      expect(res.body.count).toBe(1);
    });

    it('200 — filtre par jeu', async () => {
      Tournament.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([fakeTournament]),
      });

      const res = await request(app).get('/api/tournois?game=CS2');
      expect(res.status).toBe(200);
    });

    it('200 — filtre par statut', async () => {
      Tournament.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app).get('/api/tournois?status=finished');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });

  });

  // ══════════════════════════════════════════════════════
  // GET /api/tournois/:id  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/tournois/:id', () => {

    it('200 — retourne un tournoi par ID', async () => {
      Tournament.findById.mockResolvedValue(fakeTournament);

      const res = await request(app).get(`/api/tournois/${TOURNAMENT_ID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tournament');
    });

    it('404 — tournoi inexistant', async () => {
      Tournament.findById.mockResolvedValue(null);

      const res = await request(app).get(`/api/tournois/${TOURNAMENT_ID}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Tournoi introuvable');
    });

  });

  // ══════════════════════════════════════════════════════
  // POST /api/tournois  — admin requis
  // ══════════════════════════════════════════════════════

  describe('POST /api/tournois', () => {

    const validBody = {
      name: 'IEM Katowice', game: 'CS2', prizePool: 1000000,
      startDate: '2025-02-01', endDate: '2025-02-10', location: 'Katowice',
    };

    it('201 — tournoi créé par un admin', async () => {
      mockAdminAuth();

      const res = await request(app)
        .post('/api/tournois')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Tournoi créé avec succès');
    });

    it('401 — sans token', async () => {
      const res = await request(app).post('/api/tournois').send(validBody);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .post('/api/tournois')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(403);
    });

    it('400 — nom de tournoi déjà utilisé (duplicate key)', async () => {
      mockAdminAuth();
      Tournament.mockImplementation(() => ({
        ...validBody,
        save: jest.fn().mockRejectedValue({ code: 11000 }),
      }));

      const res = await request(app)
        .post('/api/tournois')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Ce tournoi existe déjà');
    });

  });

  // ══════════════════════════════════════════════════════
  // PUT /api/tournois/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('PUT /api/tournois/:id', () => {

    it('200 — tournoi modifié par un admin', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue(fakeTournament);
      Tournament.findByIdAndUpdate.mockResolvedValue({ ...fakeTournament, status: 'ongoing' });

      const res = await request(app)
        .put(`/api/tournois/${TOURNAMENT_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ status: 'ongoing' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Tournoi modifié avec succès');
    });

    it('404 — tournoi inexistant', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/tournois/${TOURNAMENT_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ status: 'ongoing' });

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).put(`/api/tournois/${TOURNAMENT_ID}`).send({});
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .put(`/api/tournois/${TOURNAMENT_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ status: 'ongoing' });

      expect(res.status).toBe(403);
    });

  });

  // ══════════════════════════════════════════════════════
  // DELETE /api/tournois/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('DELETE /api/tournois/:id', () => {

    it('200 — tournoi supprimé par un admin', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue(fakeTournament);
      Tournament.findByIdAndDelete.mockResolvedValue(fakeTournament);

      const res = await request(app)
        .delete(`/api/tournois/${TOURNAMENT_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Tournoi supprimé avec succès');
    });

    it('404 — tournoi inexistant', async () => {
      mockAdminAuth();
      Tournament.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/tournois/${TOURNAMENT_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).delete(`/api/tournois/${TOURNAMENT_ID}`);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .delete(`/api/tournois/${TOURNAMENT_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(403);
    });

  });

});
