/**
 * Tests des routes /api/auth
 * register, login, leaderboard, /me
 */

const request = require('supertest');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return { ...actual, connect: jest.fn().mockResolvedValue(true) };
});

const USER_ID = new mongoose.Types.ObjectId().toString();

// Pas d'IDs dans les factories — uniquement des jest.fn()
jest.mock('../models/User', () => ({
  findById: jest.fn(),
  findOne:  jest.fn(),
  find:     jest.fn(),
}));
jest.mock('bcrypt', () => ({
  hash:    jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));
jest.mock('../utils/jwt', () => ({
  verifyToken:   jest.fn(),
  generateToken: jest.fn().mockReturnValue('fake.jwt.token'),
}));

const app    = require('../app');
const jwt    = require('../utils/jwt');
const User   = require('../models/User');
const bcrypt = require('bcrypt');

function makeFakeQuery(value) {
  const p = Promise.resolve(value);
  return {
    select: jest.fn().mockResolvedValue(value),
    sort:   jest.fn().mockReturnThis(),
    limit:  jest.fn().mockResolvedValue(Array.isArray(value) ? value : [value]),
    then:   (...args) => p.then(...args),
    catch:  (...args) => p.catch(...args),
  };
}

function mockUserAuth(userId = USER_ID, role = 'user') {
  jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId, role } });
  const fakeUser = { _id: userId, username: 'testuser', email: 'test@test.com', role, points: 500 };
  User.findById.mockReturnValue(makeFakeQuery(fakeUser));
}

const VALID_TOKEN = 'Bearer fake.jwt.token';

describe('Routes /api/auth', () => {

  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════════════════════════════════
  // POST /api/auth/register
  // ══════════════════════════════════════════════════════

  describe('POST /api/auth/register', () => {

    it('400 — données manquantes (pas de password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Données manquantes');
    });

    it('400 — données manquantes (pas de username)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Données manquantes');
    });

    it('400 — mot de passe trop court (< 6 caractères)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', email: 'test@test.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Mot de passe trop court');
    });

    it('400 — email déjà utilisé', async () => {
      User.findOne.mockResolvedValue({ email: 'new@test.com', username: 'autreuser' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'new@test.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email déjà utilisé');
    });

    it('400 — username déjà utilisé', async () => {
      User.findOne.mockResolvedValue({ email: 'autre@test.com', username: 'newuser' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'new@test.com', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Username déjà utilisé');
    });

  });

  // ══════════════════════════════════════════════════════
  // POST /api/auth/login
  // ══════════════════════════════════════════════════════

  describe('POST /api/auth/login', () => {

    it('200 — connexion réussie', async () => {
      const fakeUser = {
        _id: USER_ID, username: 'testuser', email: 'test@test.com',
        role: 'user', points: 500, passwordHash: 'hashed',
      };
      User.findOne.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toBe('Connexion réussie');
    });

    it('400 — données manquantes (pas de password)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Données manquantes');
    });

    it('400 — données manquantes (pas d\'email)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Données manquantes');
    });

    it('401 — utilisateur inexistant', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inconnu@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Identifiants incorrects');
    });

    it('401 — mot de passe incorrect', async () => {
      User.findOne.mockResolvedValue({
        _id: USER_ID, email: 'test@test.com', passwordHash: 'hashed',
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'mauvais' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Identifiants incorrects');
    });

  });

  // ══════════════════════════════════════════════════════
  // GET /api/auth/leaderboard  — public
  // ══════════════════════════════════════════════════════

  describe('GET /api/auth/leaderboard', () => {

    it('200 — retourne le classement sans token', async () => {
      const fakeUsers = [
        { username: 'player1', points: 1500 },
        { username: 'player2', points: 1200 },
      ];
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort:   jest.fn().mockReturnThis(),
        limit:  jest.fn().mockResolvedValue(fakeUsers),
      });

      const res = await request(app).get('/api/auth/leaderboard');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('leaderboard');
      expect(res.body.leaderboard).toHaveLength(2);
    });

    it('200 — leaderboard vide si aucun joueur', async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort:   jest.fn().mockReturnThis(),
        limit:  jest.fn().mockResolvedValue([]),
      });

      const res = await request(app).get('/api/auth/leaderboard');

      expect(res.status).toBe(200);
      expect(res.body.leaderboard).toHaveLength(0);
    });

  });

  // ══════════════════════════════════════════════════════
  // GET /api/auth/me  — authentifié requis
  // ══════════════════════════════════════════════════════

  describe('GET /api/auth/me', () => {

    it('200 — retourne le profil de l\'utilisateur connecté', async () => {
      const fakeUser = { _id: USER_ID, username: 'testuser', email: 'test@test.com', role: 'user', points: 500 };

      // 1er appel : authMiddleware (avec .select)
      // 2e appel  : contrôleur getMe (sans .select)
      User.findById
        .mockReturnValueOnce(makeFakeQuery(fakeUser))
        .mockResolvedValueOnce(fakeUser);

      jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId: USER_ID, role: 'user' } });

      const res = await request(app).get('/api/auth/me').set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
    });

    it('401 — sans token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('401 — token invalide', async () => {
      jwt.verifyToken.mockReturnValue({ valid: false, error: 'jwt expired' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token.expire');

      expect(res.status).toBe(401);
    });

    it('404 — utilisateur supprimé après connexion', async () => {
      jwt.verifyToken.mockReturnValue({ valid: true, decoded: { userId: USER_ID, role: 'user' } });

      // Middleware trouve le user, mais getMe le trouve plus
      User.findById
        .mockReturnValueOnce(makeFakeQuery({ _id: USER_ID, username: 'test', email: 'test@test.com', role: 'user', points: 0 }))
        .mockResolvedValueOnce(null);

      const res = await request(app).get('/api/auth/me').set('Authorization', VALID_TOKEN);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Utilisateur introuvable');
    });

  });

});
