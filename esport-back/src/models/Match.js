const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'Le tournoi est obligatoire']
  },
  team1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'L\'équipe 1 est obligatoire']
  },
  team2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'L\'équipe 2 est obligatoire'],
    validate: {
      validator: function(value) {
        return !value.equals(this.team1Id);
      },
      message: 'Les deux équipes doivent être différentes'
    }
  },
  scheduledAt: {
    type: Date,
    required: [true, 'La date du match est obligatoire']
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'live', 'completed', 'cancelled'],
      message: '{VALUE} n\'est pas un statut valide'
    },
    default: 'scheduled'
  },
  scoreTeam1: {
    type: Number,
    default: 0,
    min: [0, 'Le score ne peut pas être négatif']
  },
  scoreTeam2: {
    type: Number,
    default: 0,
    min: [0, 'Le score ne peut pas être négatif']
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  bestOf: {
    type: Number,
    required: [true, 'Le format du match est obligatoire'],
    enum: {
      values: [1, 3, 5],
      message: 'Format valide: BO1, BO3 ou BO5'
    },
    default: 1
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

matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

matchSchema.index({ tournamentId: 1 });
matchSchema.index({ team1Id: 1 });
matchSchema.index({ team2Id: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Match', matchSchema);
