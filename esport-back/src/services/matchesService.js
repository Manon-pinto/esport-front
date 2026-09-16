const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Bet = require('../models/Bet');
const User = require('../models/User');
const AppError = require('../utils/AppError');

async function listMatches({ tournament_id: tournamentId, team_id: teamId, status } = {}) {
  const filter = {};
  if (tournamentId) filter.tournamentId = tournamentId;
  if (teamId) filter.$or = [{ team1Id: teamId }, { team2Id: teamId }];
  if (status) filter.status = status;

  return Match.find(filter)
    .populate('tournamentId', 'name game')
    .populate('team1Id', 'name tag logoUrl')
    .populate('team2Id', 'name tag logoUrl')
    .populate('winnerId', 'name tag')
    .sort({ scheduledAt: -1 });
}

async function getMatchById(id) {
  const match = await Match.findById(id)
    .populate('tournamentId', 'name game')
    .populate('team1Id', 'name tag logoUrl')
    .populate('team2Id', 'name tag logoUrl')
    .populate('winnerId', 'name tag');

  if (!match) throw new AppError(404, 'Match introuvable');
  return match;
}

async function createMatch({ tournamentId, team1Id, team2Id, scheduledAt, bestOf }) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new AppError(404, 'Tournoi introuvable');

  const [team1, team2] = await Promise.all([Team.findById(team1Id), Team.findById(team2Id)]);
  if (!team1 || !team2) throw new AppError(404, 'Une des équipes est introuvable');

  if (team1Id === team2Id) {
    throw new AppError(400, 'Les deux équipes doivent être différentes');
  }

  const match = new Match({
    tournamentId,
    team1Id,
    team2Id,
    scheduledAt,
    bestOf: bestOf || 1,
    status: 'scheduled',
  });
  await match.save();

  return match;
}

// Résout (gagné/perdu) ou rembourse (annulé) les paris en attente d'un match,
// selon son ancien et son nouveau statut.
async function settlePendingBets(matchId, previousStatus, updateData) {
  const newStatus = updateData.status;

  const matchIsCompleted =
    newStatus === 'completed' || previousStatus === 'completed' || previousStatus === 'finished';

  if (matchIsCompleted && updateData.winnerId) {
    const pendingBets = await Bet.find({ matchId, status: 'pending' });
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

  if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
    const pendingBets = await Bet.find({ matchId, status: 'pending' });
    for (const bet of pendingBets) {
      bet.status = 'cancelled';
      await bet.save();
      await User.findByIdAndUpdate(bet.userId, { $inc: { points: bet.amount } });
    }
  }
}

async function updateMatch(id, { scheduledAt, status, scoreTeam1, scoreTeam2, winnerId }) {
  const match = await Match.findById(id);
  if (!match) throw new AppError(404, 'Match introuvable');

  const updateData = {};
  if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt;
  if (status !== undefined) updateData.status = status;
  if (scoreTeam1 !== undefined) updateData.scoreTeam1 = scoreTeam1;
  if (scoreTeam2 !== undefined) updateData.scoreTeam2 = scoreTeam2;
  if (winnerId !== undefined) updateData.winnerId = winnerId;
  updateData.updatedAt = Date.now();

  const updatedMatch = await Match.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('tournamentId', 'name game')
    .populate('team1Id', 'name tag')
    .populate('team2Id', 'name tag')
    .populate('winnerId', 'name tag');

  await settlePendingBets(id, match.status, updateData);

  return updatedMatch;
}

async function deleteMatch(id) {
  const match = await Match.findById(id);
  if (!match) throw new AppError(404, 'Match introuvable');

  await Match.findByIdAndDelete(id);
  return match;
}

module.exports = { listMatches, getMatchById, createMatch, updateMatch, deleteMatch };
