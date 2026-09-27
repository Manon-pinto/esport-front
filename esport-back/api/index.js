// Point d'entrée pour le déploiement Vercel (fonction serverless).
// Express est compatible directement : app est un handler (req, res).
module.exports = require('../src/app');
