const betsService = require('../services/betsService');
const AppError = require('../utils/AppError');

function handleError(res, error, context) {
  console.error(`Erreur ${context}:`, error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.error, ...(error.details || {}) });
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Erreur de validation', details: messages });
  }

  res.status(500).json({ error: error.message });
}

exports.getAllBets = async (req, res) => {
  try {
    const bets = await betsService.listBets(req.user, req.query);
    res.json({ count: bets.length, bets });
  } catch (error) {
    handleError(res, error, 'getAllBets');
  }
};

exports.getBetById = async (req, res) => {
  try {
    const bet = await betsService.getBetById(req.user, req.params.id);
    res.json({ bet });
  } catch (error) {
    handleError(res, error, 'getBetById');
  }
};

exports.createBet = async (req, res) => {
  try {
    const { bet, remainingPoints } = await betsService.createBet(req.user, req.body);
    res.status(201).json({ message: 'Pari placé avec succès', bet, remainingPoints });
  } catch (error) {
    handleError(res, error, 'createBet');
  }
};

exports.cancelBet = async (req, res) => {
  try {
    const { refundedAmount, newBalance } = await betsService.cancelBet(req.user, req.params.id);
    res.json({ message: 'Pari annulé avec succès', refundedAmount, newBalance });
  } catch (error) {
    handleError(res, error, 'cancelBet');
  }
};
