const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est obligatoire'],
    unique: true,
    minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    maxlength: [20, 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  passwordHash: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'super_admin'],
      message: '{VALUE} n\'est pas un rôle valide'
    },
    default: 'user'
  },
  points: {
    type: Number,
    default: 1000,
    min: [0, 'Les points ne peuvent pas être négatifs !']
  },
  avatarUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);