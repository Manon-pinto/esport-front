const Bet = require('../models/Bet');
const Match = require('../models/Match');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const BET_POPULATE = [
  { path: 'userId', select: 'username' },
  {
    path: 'matchId',
    select: 'team1Id team2Id scheduledAt status',
    populate: [
      { path: 'team1Id', select: 'name tag' },
      { path: 'team2Id', select: 'name tag' },
    ],
  },
  { path: 'predictedWinnerId', select: 'name tag' },
];

function applyPopulate(query) {
  return BET_POPULATE.reduce((q, p) => q.populate(p), query);
}

async function listBets(user, { match_id: matchId, status } = {}) {
  const filter = {};
  if (user.role !== 'admin') filter.userId = user.id;
  if (matchId) filter.matchId = matchId;
  if (status) filter.status = status;

  return applyPopulate(Bet.find(filter)).sort({ createdAt: -1 });
}

async function getBetById(user, id) {
  const bet = await applyPopulate(Bet.findById(id));

  if (!bet) throw new AppError(404, 'Pari introuvable');
  if (user.role !== 'admin' && bet.userId._id.toString() !== user.id) {
    throw new AppError(403, 'Accès refusé');
  }
  return bet;
}

async function createBet(user, { matchId, predictedWinnerId, amount, odds }) {
  const match = await Match.findById(matchId);
  if (!match) throw new AppError(404, 'Match introuvable');

  if (match.status !== 'scheduled' && match.status !== 'live') {
    throw new AppError(400, 'Paris fermés', {
      message: 'Impossible de parier sur un match terminé ou annulé',
    });
  }

  if (predictedWinnerId !== match.team1Id.toString() && predictedWinnerId !== match.team2Id.toString()) {
    throw new AppError(400, 'Équipe invalide', {
      message: "L'équipe prédite ne participe pas à ce match",
    });
  }

  const existingBet = await Bet.findOne({ userId: user.id, matchId });
  if (existingBet) {
    throw new AppError(400, 'Pari existant', { message: 'Vous avez déjà parié sur ce match' });
  }

  // Débit atomique : n'aboutit que si le solde est suffisant,
  // évite la perte de mise à jour en cas de requêtes concurrentes
  const updatedUser = await User.findOneAndUpdate(
    { _id: user.id, points: { $gte: amount } },
    { $inc: { points: -amount } },
    { new: true }
  );

  if (!updatedUser) {
    const currentUser = await User.findById(user.id);
    throw new AppError(400, 'Points insuffisants', {
      message: `Vous avez ${currentUser ? currentUser.points : 0} points, mais vous essayez de parier ${amount}`,
    });
  }

  let bet;
  try {
    bet = new Bet({
      userId: user.id,
      matchId,
      predictedWinnerId,
      amount,
      odds,
      status: 'pending',
    });
    await bet.save();
  } catch (betError) {
    // Le pari n'a pas pu être créé (ex: doublon détecté par l'index unique) :
    // on rembourse le débit déjà effectué pour éviter une perte de points
    await User.findByIdAndUpdate(user.id, { $inc: { points: amount } });

    if (betError.code === 11000) {
      throw new AppError(400, 'Pari existant', { message: 'Vous avez déjà parié sur ce match' });
    }
    throw betError;
  }

  return { bet, remainingPoints: updatedUser.points };
}

async function cancelBet(user, id) {
  const bet = await Bet.findById(id).populate('matchId');
  if (!bet) throw new AppError(404, 'Pari introuvable');

  const isOwner = bet.userId.toString() === user.id;
  if (!isOwner && user.role !== 'admin') {
    throw new AppError(403, 'Accès refusé');
  }

  if (bet.matchId.status !== 'scheduled') {
    throw new AppError(400, 'Annulation impossible', { message: 'Le match a déjà commencé' });
  }

  await Bet.findByIdAndDelete(id);

  // Remboursement au propriétaire du pari (et non à l'admin qui l'annule le cas échéant)
  const owner = await User.findById(bet.userId);
  owner.points += bet.amount;
  await owner.save();

  return { refundedAmount: bet.amount, newBalance: owner.points };
}

module.exports = { listBets, getBetById, createBet, cancelBet };
