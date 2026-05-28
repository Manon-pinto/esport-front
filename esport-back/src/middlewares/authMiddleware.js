const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token manquant',
        message: 'Vous devez être authentifié pour accéder à cette ressource'
      });
    }

    const token = authHeader.substring(7);

    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
      return res.status(401).json({ 
        error: 'Token invalide',
        message: error
      });
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ 
        error: 'Utilisateur introuvable',
        message: 'Ce compte n\'existe plus'
      });
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points
    };

    next();

  } catch (error) {
    console.error('Erreur dans authMiddleware :', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du token' });
  }
};