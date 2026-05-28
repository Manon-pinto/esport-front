/**
 * Tests des routes /api/teams
 * GET (public), POST/PUT/DELETE (admin uniquement)
 */

const request = require('supertest');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

const USER_ID  = new mongoose.Types.ObjectId().toString();
const ADMIN_ID = new mongoose.Types.ObjectId().toString();
const TEAM_ID  = new mongoose.Types.ObjectId().toString();

jest.mock('../models/User', () => ({ findById: jest.fn() }));
jest.mock('../models/Team', () => {
  const mockSave = jest.fn().mockResolvedValue(true);
  const TeamMock = jest.fn().mockImplementation((data) => ({ ...data, _id: 'new_id', save: mockSave }));
  TeamMock.find             = jest.fn();
  TeamMock.findById         = jest.fn();
  TeamMock.findByIdAndUpdate = jest.fn();
  TeamMock.findByIdAndDelete = jest.fn();
  return TeamMock;
});
jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn(), generateToken: jest.fn() }));

const app  = require('../app');
const jwt  = require('../utils/jwt');
const User = require('../models/User');
const Team = require('../models/Team');

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

const VALID_TOKEN = 'Bearer fake.jwt.token';
const fakeTeam   = { _id: TEAM_ID, name: 'Team Alpha', tag: 'TMA', country: 'FR' };

describe('Routes /api/teams', () => {

  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════
  // GET /api/teams  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/teams', () => {

    it('200 — retourne toutes les équipes (sans token)', async () => {
      Team.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([fakeTeam]) });

      const res = await request(app).get('/api/teams');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('teams');
      expect(res.body.count).toBe(1);
    });

    it('200 — filtre par pays', async () => {
      Team.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([fakeTeam]) });

      const res = await request(app).get('/api/teams?country=FR');

      expect(res.status).toBe(200);
    });

  });

  // ══════════════════════════════════════════════════════
  // GET /api/teams/:id  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/teams/:id', () => {

    it('200 — retourne une équipe par ID', async () => {
      Team.findById.mockResolvedValue(fakeTeam);

      const res = await request(app).get(`/api/teams/${TEAM_ID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('team');
    });

    it('404 — équipe inexistante', async () => {
      Team.findById.mockResolvedValue(null);

      const res = await request(app).get(`/api/teams/${TEAM_ID}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Équipe introuvable');
    });

  });

  // ══════════════════════════════════════════════════════
  // POST /api/teams  — admin requis
  // ══════════════════════════════════════════════════════

  describe('POST /api/teams', () => {

    const validBody = { name: 'Team Beta', tag: 'TMB', country: 'ES', foundedYear: 2020 };

    it('201 — équipe créée par un admin', async () => {
      mockAdminAuth();

      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Équipe créée avec succès');
    });

    it('401 — sans token', async () => {
      const res = await request(app).post('/api/teams').send(validBody);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Accès refusé');
    });

    it('400 — nom/tag déjà utilisé (duplicate key)', async () => {
      mockAdminAuth();
      Team.mockImplementation(() => ({
        ...validBody,
        save: jest.fn().mockRejectedValue({ code: 11000 }),
      }));

      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Cette équipe existe déjà');
    });

  });

  // ══════════════════════════════════════════════════════
  // PUT /api/teams/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('PUT /api/teams/:id', () => {

    it('200 — équipe modifiée par un admin', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue(fakeTeam);
      Team.findByIdAndUpdate.mockResolvedValue({ ...fakeTeam, name: 'Team Alpha Updated' });

      const res = await request(app)
        .put(`/api/teams/${TEAM_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'Team Alpha Updated' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Équipe modifiée avec succès');
    });

    it('404 — équipe inexistante', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/teams/${TEAM_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'New Name' });

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).put(`/api/teams/${TEAM_ID}`).send({ name: 'x' });
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .put(`/api/teams/${TEAM_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'x' });

      expect(res.status).toBe(403);
    });

  });

  // ══════════════════════════════════════════════════════
  // DELETE /api/teams/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('DELETE /api/teams/:id', () => {

    it('200 — équipe supprimée par un admin', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue(fakeTeam);
      Team.findByIdAndDelete.mockResolvedValue(fakeTeam);

      const res = await request(app)
        .delete(`/api/teams/${TEAM_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Équipe supprimée avec succès');
    });

    it('404 — équipe inexistante', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/teams/${TEAM_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).delete(`/api/teams/${TEAM_ID}`);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .delete(`/api/teams/${TEAM_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(403);
    });

  });

});
