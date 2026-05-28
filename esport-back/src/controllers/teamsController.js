const Team = require('../models/Team');

exports.getAllTeams = async (req, res) => {
  try {
    const { country, is_active } = req.query;
    
    let filter = {};
    
    if (country) {
      filter.country = country.toUpperCase();
    }
    
    if (is_active !== undefined) {
      filter.isActive = is_active === 'true';
    }
    
    const teams = await Team.find(filter).sort({ name: 1 });
    
    res.json({
      count: teams.length,
      teams
    });
  } catch (error) {
    console.error('Erreur getAllTeams:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable' });
    }
    
    res.json({ team });
  } catch (error) {
    console.error('Erreur getTeamById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, tag, logoUrl, country, foundedYear, isActive } = req.body;
    
    const team = new Team({
      name,
      tag: tag?.toUpperCase(),
      logoUrl,
      country: country?.toUpperCase(),
      foundedYear,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await team.save();
    
    res.status(201).json({
      message: 'Équipe créée avec succès',
      team
    });
  } catch (error) {
    console.error('Erreur createTeam:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Cette équipe existe déjà',
        message: 'Le nom ou le tag est déjà utilisé'
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


exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tag, logoUrl, country, foundedYear, isActive } = req.body;
    
    const team = await Team.findById(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (tag !== undefined) updateData.tag = tag.toUpperCase();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (country !== undefined) updateData.country = country.toUpperCase();
    if (foundedYear !== undefined) updateData.foundedYear = foundedYear;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();
    
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Équipe modifiée avec succès',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Erreur updateTeam:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Conflit',
        message: 'Le nom ou le tag est déjà utilisé par une autre équipe'
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable' });
    }
    
    await Team.findByIdAndDelete(id);
    
    res.json({
      message: 'Équipe supprimée avec succès',
      deletedTeam: {
        id: team._id,
        name: team.name,
        tag: team.tag
      }
    });
  } catch (error) {
    console.error('Erreur deleteTeam:', error);
    res.status(500).json({ error: error.message });
  }
};

