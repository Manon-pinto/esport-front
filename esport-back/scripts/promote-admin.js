/**
 * Passe un compte existant en administrateur.
 * Usage : node scripts/promote-admin.js <email>
 * Nécessite MONGODB_URI dans l'environnement (ou un fichier .env chargé par dotenv).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promote-admin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.error(`Aucun compte trouvé pour ${email}.`);
      process.exitCode = 1;
    } else {
      console.log(`${user.username} (${user.email}) est maintenant admin.`);
    }

    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Erreur :', err.message);
    process.exit(1);
  });
