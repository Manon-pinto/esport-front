const Player = require('../models/Player');
const Team = require('../models/Team');

exports.getAllPlayers = async (req, res) => {
  try {
    const { team_id, is_active, nationality } = req.query;
    
    let filter = {};
    
    if (team_id) {
      filter.teamId = team_id;
    }
    
    if (is_active !== undefined) {
      filter.isActive = is_active === 'true';
    }
    
    if (nationality) {
      filter.nationality = nationality.toUpperCase();
    }
    
    const players = await Player.find(filter)
      .populate('teamId', 'name tag')
      .sort({ nickname: 1 });
    
    res.json({
      count: players.length,
      players
    });
  } catch (error) {
    console.error('Erreur getAllPlayers:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findById(id).populate('teamId', 'name tag logoUrl');
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur introuvable' });
    }
    
    res.json({ player });
  } catch (error) {
    console.error('Erreur getPlayerById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPlayer = async (req, res) => {
  try {
    const { teamId, nickname, realName, nationality, birthDate, photoUrl, isActive } = req.body;
  
    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Équipe introuvable' });
      }
    }
    
    const player = new Player({
      teamId: teamId || null,
      nickname,
      realName,
      nationality: nationality?.toUpperCase(),
      birthDate,
      photoUrl,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await player.save();
    
    res.status(201).json({
      message: 'Joueur créé avec succès',
      player
    });
  } catch (error) {
    console.error('Erreur createPlayer:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamId, nickname, realName, nationality, birthDate, photoUrl, isActive } = req.body;
    
    const player = await Player.findById(id);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur introuvable' });
    }

    if (teamId !== undefined && teamId !== null) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Équipe introuvable' });
      }
    }
    
    const updateData = {};
    if (teamId !== undefined) updateData.teamId = teamId;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (realName !== undefined) updateData.realName = realName;
    if (nationality !== undefined) updateData.nationality = nationality.toUpperCase();
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();
    
    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teamId', 'name tag');
    
    res.json({
      message: 'Joueur modifié avec succès',
      player: updatedPlayer
    });
  } catch (error) {
    console.error('Erreur updatePlayer:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findById(id);
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur introuvable' });
    }
    
    await Player.findByIdAndDelete(id);
    
    res.json({
      message: 'Joueur supprimé avec succès',
      deletedPlayer: {
        id: player._id,
        nickname: player.nickname
      }
    });
  } catch (error) {
    console.error('Erreur deletePlayer:', error);
    res.status(500).json({ error: error.message });
  }
};