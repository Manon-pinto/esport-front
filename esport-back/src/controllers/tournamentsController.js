const Tournament = require('../models/Tournament');

exports.getAllTournaments = async (req, res) => {
  try {
    const { game, status } = req.query;
    
    let filter = {};
    
    if (game) {
      filter.game = game;
    }
    
    if (status) {
      filter.status = status;
    }
    
    const tournaments = await Tournament.find(filter).sort({ startDate: -1 });
    
    res.json({
      count: tournaments.length,
      tournaments
    });
  } catch (error) {
    console.error('Erreur getAllTournaments:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tournament = await Tournament.findById(id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournoi introuvable' });
    }
    
    res.json({ tournament });
  } catch (error) {
    console.error('Erreur getTournamentById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createTournament = async (req, res) => {
  try {
    const { name, game, prizePool, startDate, endDate, location, status, bannerUrl } = req.body;
    
    const tournament = new Tournament({
      name,
      game,
      prizePool,
      startDate,
      endDate,
      location,
      status: status || 'upcoming',
      bannerUrl
    });
    
    await tournament.save();
    
    res.status(201).json({
      message: 'Tournoi créé avec succès',
      tournament
    });
  } catch (error) {
    console.error('Erreur createTournament:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Ce tournoi existe déjà',
        message: 'Le nom du tournoi est déjà utilisé'
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


exports.updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, game, prizePool, startDate, endDate, location, status, bannerUrl } = req.body;
    
    const tournament = await Tournament.findById(id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournoi introuvable' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (game !== undefined) updateData.game = game;
    if (prizePool !== undefined) updateData.prizePool = prizePool;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    updateData.updatedAt = Date.now();
    
    const updatedTournament = await Tournament.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Tournoi modifié avec succès',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Erreur updateTournament:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tournament = await Tournament.findById(id);
    
    if (!tournament) {
      return res.status(404).json({ error: 'Tournoi introuvable' });
    }
    
    await Tournament.findByIdAndDelete(id);
    
    res.json({
      message: 'Tournoi supprimé avec succès',
      deletedTournament: {
        id: tournament._id,
        name: tournament.name
      }
    });
  } catch (error) {
    console.error('Erreur deleteTournament:', error);
    res.status(500).json({ error: error.message });
  }
};