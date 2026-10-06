const express = require('express');
const router = express.Router();
const tournamentsController = require('../controllers/tournamentsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', tournamentsController.getAllTournaments);
router.get('/:id', tournamentsController.getTournamentById);
router.post('/', authMiddleware, isAdmin, tournamentsController.createTournament);
router.put('/:id', authMiddleware, isAdmin, tournamentsController.updateTournament);
router.delete('/:id', authMiddleware, isAdmin, tournamentsController.deleteTournament);

module.exports = router;