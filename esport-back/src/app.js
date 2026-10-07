require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const app = express();

const uri = process.env.MONGODB_URI

// Injection NoSQL : un opérateur venu du client ({ "$ne": null }) est neutralisé
// en { "$eq": { "$ne": null } } dans tous les filtres de requête Mongoose.
mongoose.set('sanitizeFilter', true);

mongoose
  .connect(uri)
  .then(() => console.log("✅ Connexion à MongoDB réussie !"))
  .catch((error) => console.log("❌ Connexion à MongoDB échouée !", error));

app.use(express.json());

// CORS : seul le frontend est autorisé à appeler l'API depuis un navigateur.
// FRONTEND_URL accepte plusieurs origines séparées par des virgules.
const allowedOrigins = (process.env.FRONTEND_URL || 'https://esport-front.vercel.app,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authRoutes = require('./routes/authRoutes');
const teamsRoutes = require('./routes/teamsRoutes');
const playersRoutes = require('./routes/playersRoutes');
const coachesRoutes = require('./routes/coachesRoutes');
const tournamentsRoutes = require('./routes/tournamentsRoutes');
const matchesRoutes = require('./routes/matchesRoutes');
const betsRoutes = require('./routes/betsRoutes');
const standingsRoutes = require('./routes/standingsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/coach', coachesRoutes);
app.use('/api/tournois', tournamentsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/pari', betsRoutes);
app.use('/api/classement', standingsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API ProLeague Tracker - Bienvenue !' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// En test, Supertest gère lui-même le démarrage du serveur.
// Sur Vercel, la fonction serverless exporte directement l'app sans écouter de port.
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;