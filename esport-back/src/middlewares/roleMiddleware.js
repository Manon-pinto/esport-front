exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentification requise',
      message: 'Vous devez être connecté'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Accès refusé',
      message: 'Vous devez être administrateur pour effectuer cette action',
      yourRole: req.user.role
    });
  }

  next();
}