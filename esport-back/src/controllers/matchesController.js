const matchesService = require('../services/matchesService');
const handleError = require('../utils/handleError');

exports.getAllMatches = async (req, res) => {
  try {
    const matches = await matchesService.listMatches(req.query);
    res.json({ count: matches.length, matches });
  } catch (error) {
    handleError(res, error, 'getAllMatches');
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const match = await matchesService.getMatchById(req.params.id);
    res.json({ match });
  } catch (error) {
    handleError(res, error, 'getMatchById');
  }
};

exports.createMatch = async (req, res) => {
  try {
    const match = await matchesService.createMatch(req.body);
    res.status(201).json({ message: 'Match créé avec succès', match });
  } catch (error) {
    handleError(res, error, 'createMatch');
  }
};

exports.updateMatch = async (req, res) => {
  try {
    const match = await matchesService.updateMatch(req.params.id, req.body);
    res.json({ message: 'Match modifié avec succès', match });
  } catch (error) {
    handleError(res, error, 'updateMatch');
  }
};

exports.deleteMatch = async (req, res) => {
  try {
    const match = await matchesService.deleteMatch(req.params.id);
    res.json({ message: 'Match supprimé avec succès', deletedMatch: { id: match._id } });
  } catch (error) {
    handleError(res, error, 'deleteMatch');
  }
};
