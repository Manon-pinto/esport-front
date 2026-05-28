const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'Le tournoi est obligatoire']
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'L\'équipe est obligatoire']
  },
  matchesPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de matchs ne peut pas être négatif']
  },
  wins: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de victoires ne peut pas être négatif']
  },
  losses: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de défaites ne peut pas être négatif']
  },
  draws: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de nuls ne peut pas être négatif']
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Les points ne peuvent pas être négatifs']
  },
  goalsFor: {
    type: Number,
    default: 0,
    min: [0, 'Les buts marqués ne peuvent pas être négatifs']
  },
  goalsAgainst: {
    type: Number,
    default: 0,
    min: [0, 'Les buts encaissés ne peuvent pas être négatifs']
  },
  goalDifference: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    min: [1, 'Le rang doit être au minimum 1']
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

standingSchema.pre('save', function(next) {
  // Calculer la différence de buts
  this.goalDifference = this.goalsFor - this.goalsAgainst;
  this.updatedAt = Date.now();
  next();
});

standingSchema.index({ tournamentId: 1, teamId: 1 }, { unique: true });
standingSchema.index({ tournamentId: 1, points: -1, goalDifference: -1 });

module.exports = mongoose.model('Standing', standingSchema);
