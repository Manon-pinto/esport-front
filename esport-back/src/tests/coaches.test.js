/**
 * Tests des routes /api/coach
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
const COACH_ID = new mongoose.Types.ObjectId().toString();
const TEAM_ID  = new mongoose.Types.ObjectId().toString();

jest.mock('../models/User',  () => ({ findById: jest.fn() }));
jest.mock('../models/Team',  () => ({ findById: jest.fn() }));
jest.mock('../models/Coach', () => {
  const mockSave  = jest.fn().mockResolvedValue(true);
  const CoachMock = jest.fn().mockImplementation((data) => ({ ...data, save: mockSave }));
  CoachMock.find              = jest.fn();
  CoachMock.findById          = jest.fn();
  CoachMock.findByIdAndUpdate = jest.fn();
  CoachMock.findByIdAndDelete = jest.fn();
  return CoachMock;
});
jest.mock('../utils/jwt', () => ({ verifyToken: jest.fn(), generateToken: jest.fn() }));

const app   = require('../app');
const jwt   = require('../utils/jwt');
const User  = require('../models/User');
const Team  = require('../models/Team');
const Coach = require('../models/Coach');

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
const fakeCoach   = { _id: COACH_ID, name: 'Zonic', nationality: 'DK', teamId: TEAM_ID };

describe('Routes /api/coach', () => {

  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════
  // GET /api/coach  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/coach', () => {

    it('200 — retourne tous les coachs (sans token)', async () => {
      Coach.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([fakeCoach]),
      });

      const res = await request(app).get('/api/coach');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('coaches');
      expect(res.body.count).toBe(1);
    });

    it('200 — filtre par équipe', async () => {
      Coach.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([fakeCoach]),
      });

      const res = await request(app).get(`/api/coach?team_id=${TEAM_ID}`);
      expect(res.status).toBe(200);
    });

    it('200 — filtre par nationalité', async () => {
      Coach.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockResolvedValue([fakeCoach]),
      });

      const res = await request(app).get('/api/coach?nationality=DK');
      expect(res.status).toBe(200);
    });

  });

  // ══════════════════════════════════════════════════════
  // GET /api/coach/:id  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/coach/:id', () => {

    it('200 — retourne un coach par ID', async () => {
      Coach.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeCoach),
      });

      const res = await request(app).get(`/api/coach/${COACH_ID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('coach');
    });

    it('404 — coach inexistant', async () => {
      Coach.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get(`/api/coach/${COACH_ID}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Coach introuvable');
    });

  });

  // ══════════════════════════════════════════════════════
  // POST /api/coach  — admin requis
  // ══════════════════════════════════════════════════════

  describe('POST /api/coach', () => {

    const validBody = { name: 'Kassad', nationality: 'RS', teamId: TEAM_ID, experience: 5 };

    it('201 — coach créé par un admin', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue({ _id: TEAM_ID });

      const res = await request(app)
        .post('/api/coach')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Coach créé avec succès');
    });

    it('401 — sans token', async () => {
      const res = await request(app).post('/api/coach').send(validBody);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .post('/api/coach')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(403);
    });

    it('404 — équipe inexistante', async () => {
      mockAdminAuth();
      Team.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/coach')
        .set('Authorization', VALID_TOKEN)
        .send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Équipe introuvable');
    });

  });

  // ══════════════════════════════════════════════════════
  // PUT /api/coach/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('PUT /api/coach/:id', () => {

    it('200 — coach modifié par un admin', async () => {
      mockAdminAuth();
      Coach.findById.mockResolvedValue(fakeCoach);
      Coach.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ ...fakeCoach, name: 'Kassad' }),
      });

      const res = await request(app)
        .put(`/api/coach/${COACH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'Kassad' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Coach modifié avec succès');
    });

    it('404 — coach inexistant', async () => {
      mockAdminAuth();
      Coach.findById.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/coach/${COACH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'x' });

      expect(res.status).toBe(404);
    });

    it('404 — nouvelle équipe inexistante', async () => {
      mockAdminAuth();
      Coach.findById.mockResolvedValue(fakeCoach);
      Team.findById.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/coach/${COACH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ teamId: new mongoose.Types.ObjectId().toString() });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Équipe introuvable');
    });

    it('401 — sans token', async () => {
      const res = await request(app).put(`/api/coach/${COACH_ID}`).send({});
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .put(`/api/coach/${COACH_ID}`)
        .set('Authorization', VALID_TOKEN)
        .send({ name: 'x' });

      expect(res.status).toBe(403);
    });

  });

  // ══════════════════════════════════════════════════════
  // DELETE /api/coach/:id  — admin requis
  // ══════════════════════════════════════════════════════

  describe('DELETE /api/coach/:id', () => {

    it('200 — coach supprimé par un admin', async () => {
      mockAdminAuth();
      Coach.findById.mockResolvedValue(fakeCoach);
      Coach.findByIdAndDelete.mockResolvedValue(fakeCoach);

      const res = await request(app)
        .delete(`/api/coach/${COACH_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Coach supprimé avec succès');
    });

    it('404 — coach inexistant', async () => {
      mockAdminAuth();
      Coach.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/coach/${COACH_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
    });

    it('401 — sans token', async () => {
      const res = await request(app).delete(`/api/coach/${COACH_ID}`);
      expect(res.status).toBe(401);
    });

    it('403 — utilisateur normal refusé', async () => {
      mockAuth(USER_ID, 'user');

      const res = await request(app)
        .delete(`/api/coach/${COACH_ID}`)
        .set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(403);
    });

  });

});
