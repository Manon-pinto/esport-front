const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du tournoi est obligatoire'],
    unique: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    trim: true
  },
  game: {
    type: String,
    required: [true, 'Le jeu est obligatoire'],
    enum: {
      values: ['League of Legends', 'CS:GO', 'Valorant', 'Dota 2', 'Overwatch', 'Rocket League', 'Rainbow Six Siege'],
      message: '{VALUE} n\'est pas un jeu supporté'
    }
  },
  prizePool: {
    type: Number,
    required: [true, 'Le prize pool est obligatoire'],
    min: [0, 'Le prize pool ne peut pas être négatif']
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est obligatoire']
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est obligatoire'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'La date de fin doit être après la date de début'
    }
  },
  location: {
    type: String,
    required: [true, 'Le lieu est obligatoire'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      message: '{VALUE} n\'est pas un statut valide'
    },
    default: 'upcoming'
  },
  bannerUrl: {
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

tournamentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

tournamentSchema.index({ name: 1 });
tournamentSchema.index({ game: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);
