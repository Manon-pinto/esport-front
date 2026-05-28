const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Bet = require('../models/Bet');
const User = require('../models/User');

exports.getAllMatches = async (req, res) => {
  try {
    const { tournament_id, team_id, status } = req.query;
    
    let filter = {};
    
    if (tournament_id) {
      filter.tournamentId = tournament_id;
    }
    
    if (team_id) {
      filter.$or = [
        { team1Id: team_id },
        { team2Id: team_id }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    const matches = await Match.find(filter)
      .populate('tournamentId', 'name game')
      .populate('team1Id', 'name tag logoUrl')
      .populate('team2Id', 'name tag logoUrl')
      .populate('winnerId', 'name tag')
      .sort({ scheduledAt: -1 });
    
    res.json({
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Erreur getAllMatches:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await Match.findById(id)
      .populate('tournamentId', 'name game')
      .populate('team1Id', 'name tag logoUrl')
      .populate('team2Id', 'name tag logoUrl')
      .populate('winnerId', 'name tag');
    
    if (!match) {
      return res.status(404).json({ error: 'Match introuvable' });
    }
    
    res.json({ match });
  } catch (error) {
    console.error('Erreur getMatchById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { tournamentId, team1Id, team2Id, scheduledAt, bestOf } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournoi introuvable' });
    }

    const team1 = await Team.findById(team1Id);
    const team2 = await Team.findById(team2Id);
    
    if (!team1 || !team2) {
      return res.status(404).json({ error: 'Une des équipes est introuvable' });
    }
    
    if (team1Id === team2Id) {
      return res.status(400).json({ error: 'Les deux équipes doivent être différentes' });
    }
    
    const match = new Match({
      tournamentId,
      team1Id,
      team2Id,
      scheduledAt,
      bestOf: bestOf || 1,
      status: 'scheduled'
    });
    
    await match.save();
    
    res.status(201).json({
      message: 'Match créé avec succès',
      match
    });
  } catch (error) {
    console.error('Erreur createMatch:', error);
    
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

exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, status, scoreTeam1, scoreTeam2, winnerId } = req.body;
    
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({ error: 'Match introuvable' });
    }
    
    const updateData = {};
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt;
    if (status !== undefined) updateData.status = status;
    if (scoreTeam1 !== undefined) updateData.scoreTeam1 = scoreTeam1;
    if (scoreTeam2 !== undefined) updateData.scoreTeam2 = scoreTeam2;
    if (winnerId !== undefined) updateData.winnerId = winnerId;
    updateData.updatedAt = Date.now();
    
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('tournamentId', 'name game')
      .populate('team1Id', 'name tag')
      .populate('team2Id', 'name tag')
      .populate('winnerId', 'name tag');

    // ── Résolution automatique des paris ──────────────────────────
    const previousStatus = match.status;
    const newStatus = updateData.status;

    // Match terminé avec un vainqueur → résoudre les paris
    // Déclenché si : (match devient "completed" OU était déjà terminé/finished) ET un winner est défini
    const matchIsCompleted = newStatus === 'completed' || previousStatus === 'completed' || previousStatus === 'finished';
    if (matchIsCompleted && updateData.winnerId) {
      const pendingBets = await Bet.find({ matchId: id, status: 'pending' });
      for (const bet of pendingBets) {
        const won = bet.predictedWinnerId.toString() === updateData.winnerId.toString();
        bet.status = won ? 'won' : 'lost';
        // Recalcul si potentialWin était à 0 (données créées manuellement en DB)
        if (bet.potentialWin === 0) bet.potentialWin = Math.round(bet.amount * bet.odds);
        await bet.save();
        if (won) {
          await User.findByIdAndUpdate(bet.userId, { $inc: { points: bet.potentialWin } });
        }
      }
    }

    // Match annulé → rembourser tous les paris en attente
    if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
      const pendingBets = await Bet.find({ matchId: id, status: 'pending' });
      for (const bet of pendingBets) {
        bet.status = 'cancelled';
        await bet.save();
        await User.findByIdAndUpdate(bet.userId, { $inc: { points: bet.amount } });
      }
    }
    // ─────────────────────────────────────────────────────────────

    res.json({
      message: 'Match modifié avec succès',
      match: updatedMatch
    });
  } catch (error) {
    console.error('Erreur updateMatch:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({ error: 'Match introuvable' });
    }
    
    await Match.findByIdAndDelete(id);
    
    res.json({
      message: 'Match supprimé avec succès',
      deletedMatch: {
        id: match._id
      }
    });
  } catch (error) {
    console.error('Erreur deleteMatch:', error);
    res.status(500).json({ error: error.message });
  }
};