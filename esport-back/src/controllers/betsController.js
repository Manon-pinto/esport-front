const betsService = require('../services/betsService');
const handleError = require('../utils/handleError');

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
