const Coach = require('../models/Coach');
const Team = require('../models/Team');

exports.getAllCoaches = async (req, res) => {
  try {
    const { team_id, nationality, is_active } = req.query;
    
    let filter = {};
    
    if (team_id) {
      filter.teamId = team_id;
    }
    
    if (nationality) {
      filter.nationality = nationality.toUpperCase();
    }
    
    if (is_active !== undefined) {
      filter.isActive = is_active === 'true';
    }
    
    const coaches = await Coach.find(filter)
      .populate('teamId', 'name tag logoUrl')
      .sort({ name: 1 });
    
    res.json({
      count: coaches.length,
      coaches
    });
  } catch (error) {
    console.error('Erreur getAllCoaches:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCoachById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coach = await Coach.findById(id).populate('teamId', 'name tag logoUrl');
    
    if (!coach) {
      return res.status(404).json({ error: 'Coach introuvable' });
    }
    
    res.json({ coach });
  } catch (error) {
    console.error('Erreur getCoachById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createCoach = async (req, res) => {
  try {
    const { teamId, name, nationality, experience, photoUrl, isActive } = req.body;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Équipe introuvable' });
    }
    
    const coach = new Coach({
      teamId,
      name,
      nationality: nationality?.toUpperCase(),
      experience,
      photoUrl,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await coach.save();
    
    res.status(201).json({
      message: 'Coach créé avec succès',
      coach
    });
  } catch (error) {
    console.error('Erreur createCoach:', error);
    
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

exports.updateCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamId, name, nationality, experience, photoUrl, isActive } = req.body;
    
    const coach = await Coach.findById(id);
    
    if (!coach) {
      return res.status(404).json({ error: 'Coach introuvable' });
    }

    if (teamId !== undefined) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Équipe introuvable' });
      }
    }
    
    const updateData = {};
    if (teamId !== undefined) updateData.teamId = teamId;
    if (name !== undefined) updateData.name = name;
    if (nationality !== undefined) updateData.nationality = nationality.toUpperCase();
    if (experience !== undefined) updateData.experience = experience;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();
    
    const updatedCoach = await Coach.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teamId', 'name tag');
    
    res.json({
      message: 'Coach modifié avec succès',
      coach: updatedCoach
    });
  } catch (error) {
    console.error('Erreur updateCoach:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coach = await Coach.findById(id);
    
    if (!coach) {
      return res.status(404).json({ error: 'Coach introuvable' });
    }
    
    await Coach.findByIdAndDelete(id);
    
    res.json({
      message: 'Coach supprimé avec succès',
      deletedCoach: {
        id: coach._id,
        name: coach.name
      }
    });
  } catch (error) {
    console.error('Erreur deleteCoach:', error);
    res.status(500).json({ error: error.message });
  }
};
