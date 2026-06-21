const Bet = require('../models/Bet');
const Match = require('../models/Match');
const User = require('../models/User');

exports.getAllBets = async (req, res) => {
  try {
    const { match_id, status } = req.query;
    
    let filter = {};
    
    if (req.user.role !== 'admin') {
      filter.userId = req.user.id;
    }
    
    if (match_id) {
      filter.matchId = match_id;
    }
    
    if (status) {
      filter.status = status;
    }
    
    const bets = await Bet.find(filter)
      .populate('userId', 'username')
      .populate({
        path: 'matchId',
        select: 'team1Id team2Id scheduledAt status',
        populate: [
          { path: 'team1Id', select: 'name tag' },
          { path: 'team2Id', select: 'name tag' }
        ]
      })
      .populate('predictedWinnerId', 'name tag')
      .sort({ createdAt: -1 });
    
    res.json({
      count: bets.length,
      bets
    });
  } catch (error) {
    console.error('Erreur getAllBets:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bet = await Bet.findById(id)
      .populate('userId', 'username')
      .populate({
        path: 'matchId',
        select: 'team1Id team2Id scheduledAt status',
        populate: [
          { path: 'team1Id', select: 'name tag' },
          { path: 'team2Id', select: 'name tag' }
        ]
      })
      .populate('predictedWinnerId', 'name tag');
    
    if (!bet) {
      return res.status(404).json({ error: 'Pari introuvable' });
    }
    
    if (req.user.role !== 'admin' && bet.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    res.json({ bet });
  } catch (error) {
    console.error('Erreur getBetById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createBet = async (req, res) => {
  try {
    const { matchId, predictedWinnerId, amount, odds } = req.body;
    const userId = req.user.id;
   
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match introuvable' });
    }
    
    if (match.status !== 'scheduled' && match.status !== 'live') {
      return res.status(400).json({
        error: 'Paris fermés',
        message: 'Impossible de parier sur un match terminé ou annulé'
      });
    }
    
    if (predictedWinnerId !== match.team1Id.toString() && 
        predictedWinnerId !== match.team2Id.toString()) {
      return res.status(400).json({ 
        error: 'Équipe invalide',
        message: 'L\'équipe prédite ne participe pas à ce match'
      });
    }

    const existingBet = await Bet.findOne({ userId, matchId });
    if (existingBet) {
      return res.status(400).json({
        error: 'Pari existant',
        message: 'Vous avez déjà parié sur ce match'
      });
    }

    // Débit atomique : n'aboutit que si le solde est suffisant,
    // évite la perte de mise à jour en cas de requêtes concurrentes
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, points: { $gte: amount } },
      { $inc: { points: -amount } },
      { new: true }
    );

    if (!updatedUser) {
      const currentUser = await User.findById(userId);
      return res.status(400).json({
        error: 'Points insuffisants',
        message: `Vous avez ${currentUser ? currentUser.points : 0} points, mais vous essayez de parier ${amount}`
      });
    }

    let bet;
    try {
      bet = new Bet({
        userId,
        matchId,
        predictedWinnerId,
        amount,
        odds,
        status: 'pending'
      });

      await bet.save();
    } catch (betError) {
      // Le pari n'a pas pu être créé (ex: doublon détecté par l'index unique) :
      // on rembourse le débit déjà effectué pour éviter une perte de points
      await User.findByIdAndUpdate(userId, { $inc: { points: amount } });

      if (betError.code === 11000) {
        return res.status(400).json({
          error: 'Pari existant',
          message: 'Vous avez déjà parié sur ce match'
        });
      }

      throw betError;
    }

    res.status(201).json({
      message: 'Pari placé avec succès',
      bet,
      remainingPoints: updatedUser.points
    });
  } catch (error) {
    console.error('Erreur createBet:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Erreur de validation',
        details: messages
      });
    }

    res.status(500).json({ error: error.message });
  }
};

exports.cancelBet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bet = await Bet.findById(id).populate('matchId');
    
    if (!bet) {
      return res.status(404).json({ error: 'Pari introuvable' });
    }

    if (bet.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    if (bet.matchId.status !== 'scheduled') {
      return res.status(400).json({ 
        error: 'Annulation impossible',
        message: 'Le match a déjà commencé'
      });
    }
    await Bet.findByIdAndDelete(id);

    const user = await User.findById(req.user.id);
    user.points += bet.amount;
    await user.save();

    res.json({
      message: 'Pari annulé avec succès',
      refundedAmount: bet.amount,
      newBalance: user.points
    });
  } catch (error) {
    console.error('Erreur cancelBet:', error);
    res.status(500).json({ error: error.message });
  }
};