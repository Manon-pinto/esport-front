const Standing = require('../models/Standing');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

exports.getAllStandings = async (req, res) => {
  try {
    const { tournament_id } = req.query;
    
    let filter = {};
    
    if (tournament_id) {
      filter.tournamentId = tournament_id;
    }
    
    const standings = await Standing.find(filter)
      .populate('tournamentId', 'name game')
      .populate('teamId', 'name tag logoUrl')
      .sort({ tournamentId: 1, points: -1, goalDifference: -1 });
    
    res.json({
      count: standings.length,
      standings
    });
  } catch (error) {
    console.error('Erreur getAllStandings:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStandingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const standing = await Standing.findById(id)
      .populate('tournamentId', 'name game')
      .populate('teamId', 'name tag logoUrl');
    
    if (!standing) {
      return res.status(404).json({ error: 'Classement introuvable' });
    }
    
    res.json({ standing });
  } catch (error) {
    console.error('Erreur getStandingById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createStanding = async (req, res) => {
  try {
    const { tournamentId, teamId, matchesPlayed, wins, losses, draws, points, goalsFor, goalsAgainst, rank } = req.body; 

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournoi introuvable' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable' });
    }
 
    const existingStanding = await Standing.findOne({ tournamentId, teamId });
    if (existingStanding) {
      return res.status(400).json({ 
        error: 'Classement existant',
        message: 'Cette équipe a déjà une entrée dans ce tournoi'
      });
    }
    
    const standing = new Standing({
      tournamentId,
      teamId,
      matchesPlayed: matchesPlayed || 0,
      wins: wins || 0,
      losses: losses || 0,
      draws: draws || 0,
      points: points || 0,
      goalsFor: goalsFor || 0,
      goalsAgainst: goalsAgainst || 0,
      rank
    });
    
    await standing.save();
    
    res.status(201).json({
      message: 'Classement créé avec succès',
      standing
    });
  } catch (error) {
    console.error('Erreur createStanding:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Doublon',
        message: 'Cette équipe a déjà une entrée dans ce tournoi'
      });
    }
    
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

exports.updateStanding = async (req, res) => {
  try {
    const { id } = req.params;
    const { matchesPlayed, wins, losses, draws, points, goalsFor, goalsAgainst, rank } = req.body;
    
    const standing = await Standing.findById(id);
    
    if (!standing) {
      return res.status(404).json({ error: 'Classement introuvable' });
    }
    
    const updateData = {};
    if (matchesPlayed !== undefined) updateData.matchesPlayed = matchesPlayed;
    if (wins !== undefined) updateData.wins = wins;
    if (losses !== undefined) updateData.losses = losses;
    if (draws !== undefined) updateData.draws = draws;
    if (points !== undefined) updateData.points = points;
    if (goalsFor !== undefined) updateData.goalsFor = goalsFor;
    if (goalsAgainst !== undefined) updateData.goalsAgainst = goalsAgainst;
    if (rank !== undefined) updateData.rank = rank;
    updateData.updatedAt = Date.now();
    
    const updatedStanding = await Standing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('tournamentId', 'name game')
      .populate('teamId', 'name tag');
    
    res.json({
      message: 'Classement modifié avec succès',
      standing: updatedStanding
    });
  } catch (error) {
    console.error('Erreur updateStanding:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStanding = async (req, res) => {
  try {
    const { id } = req.params;
    
    const standing = await Standing.findById(id);
    
    if (!standing) {
      return res.status(404).json({ error: 'Classement introuvable' });
    }
    
    await Standing.findByIdAndDelete(id);
    
    res.json({
      message: 'Classement supprimé avec succès',
      deletedStanding: {
        id: standing._id
      }
    });
  } catch (error) {
    console.error('Erreur deleteStanding:', error);
    res.status(500).json({ error: error.message });
  }
};