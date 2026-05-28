require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const app = express();

const uri = process.env.MONGODB_URI

mongoose
  .connect(uri)
  .then(() => console.log("✅ Connexion à MongoDB réussie !"))
  .catch((error) => console.log("❌ Connexion à MongoDB échouée !", error));

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

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

// En test, Supertest gère lui-même le démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;