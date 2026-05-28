const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Username, email et password sont requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          error: 'Email déjà utilisé',
          message: 'Un compte existe déjà avec cet email'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          error: 'Username déjà utilisé',
          message: 'Ce nom d\'utilisateur est déjà pris'
        });
      }
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    const user = new User({
      username,
      email,
      passwordHash,
      role: 'user', 
      points: 1000
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Erreur de validation',
        details: messages
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        message: 'Email et password sont requis'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        error: 'Identifiants incorrects',
        message: 'Email ou mot de passe invalide'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Identifiants incorrects',
        message: 'Email ou mot de passe invalide'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('username points')
      .sort({ points: -1 })
      .limit(50);

    res.json({ leaderboard: users });
  } catch (error) {
    console.error('Erreur leaderboard :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};