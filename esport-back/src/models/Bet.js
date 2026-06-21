const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est obligatoire']
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: [true, 'Le match est obligatoire']
  },
  predictedWinnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'L\'équipe prédite est obligatoire']
  },
  amount: {
    type: Number,
    required: [true, 'Le montant du pari est obligatoire'],
    min: [10, 'Le pari minimum est de 10 points'],
    max: [1000, 'Le pari maximum est de 1000 points']
  },
  odds: {
    type: Number,
    required: [true, 'La cote est obligatoire'],
    min: [1.01, 'Cote minimum: 1.01'],
    max: [10.0, 'Cote maximum: 10.0']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'won', 'lost', 'cancelled'],
      message: '{VALUE} n\'est pas un statut valide'
    },
    default: 'pending'
  },
  potentialWin: {
    type: Number,
    default: 0
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

betSchema.pre('save', function(next) {
  // Calculer le gain potentiel
  if (this.isNew || this.isModified('amount') || this.isModified('odds')) {
    this.potentialWin = Math.round(this.amount * this.odds);
  }
  this.updatedAt = Date.now();
  next();
});

betSchema.index({ userId: 1 });
betSchema.index({ matchId: 1 });
betSchema.index({ status: 1 });
betSchema.index({ createdAt: -1 });
betSchema.index({ userId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Bet', betSchema);
