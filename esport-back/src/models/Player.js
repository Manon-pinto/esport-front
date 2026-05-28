const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  nickname: {
    type: String,
    required: [true, 'Le pseudonyme est obligatoire'],
    unique: true,
    minlength: [2, 'Le pseudonyme doit contenir au moins 2 caractères'],
    maxlength: [30, 'Le pseudonyme ne peut pas dépasser 30 caractères'],
    trim: true
  },
  realName: {
    type: String,
    required: [true, 'Le nom réel est obligatoire'],
    trim: true
  },
  nationality: {
    type: String,
    required: [true, 'La nationalité est obligatoire'],
    uppercase: true,
    minlength: [2, 'Code pays ISO 2 caractères'],
    maxlength: [2, 'Code pays ISO 2 caractères']
  },
  birthDate: {
    type: Date,
    required: [true, 'La date de naissance est obligatoire']
  },
  photoUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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

playerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

playerSchema.index({ nickname: 1 });
playerSchema.index({ teamId: 1 });
playerSchema.index({ nationality: 1 });

module.exports = mongoose.model('Player', playerSchema);
