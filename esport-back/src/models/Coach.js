const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'L\'équipe est obligatoire']
  },
  name: {
    type: String,
    required: [true, 'Le nom du coach est obligatoire'],
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
  },
  nationality: {
    type: String,
    required: [true, 'La nationalité est obligatoire'],
    uppercase: true,
    minlength: [2, 'Code pays ISO 2 caractères'],
    maxlength: [2, 'Code pays ISO 2 caractères']
  },
  experience: {
    type: Number,
    min: [0, 'L\'expérience ne peut pas être négative'],
    default: 0
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

coachSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

coachSchema.index({ teamId: 1 });
coachSchema.index({ name: 1 });

module.exports = mongoose.model('Coach', coachSchema);
