const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'équipe est obligatoire'],
    unique: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    trim: true
  },
  tag: {
    type: String,
    required: [true, 'Le tag est obligatoire'],
    unique: true,
    uppercase: true,
    minlength: [2, 'Le tag doit contenir au moins 2 caractères'],
    maxlength: [5, 'Le tag ne peut pas dépasser 5 caractères'],
    trim: true
  },
  logoUrl: {
    type: String,
    default: null
  },
  country: {
    type: String,
    required: [true, 'Le pays est obligatoire'],
    uppercase: true,
    minlength: [2, 'Code pays ISO 2 caractères'],
    maxlength: [2, 'Code pays ISO 2 caractères']
  },
  foundedYear: {
    type: Number,
    min: [1900, 'Année invalide'],
    max: [new Date().getFullYear(), 'Année future non autorisée']
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

teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

teamSchema.index({ name: 1 });
teamSchema.index({ tag: 1 });
teamSchema.index({ country: 1 });

module.exports = mongoose.model('Team', teamSchema);
