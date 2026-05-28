const express = require('express');
const router = express.Router();
const tournamentsController = require('../controllers/tournamentsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');

router.get('/', tournamentsController.getAllTournaments);
router.get('/:id', tournamentsController.getTournamentById);
router.post('/', authMiddleware, isSuperAdmin, tournamentsController.createTournament);
router.put('/:id', authMiddleware, isSuperAdmin, tournamentsController.updateTournament);
router.delete('/:id', authMiddleware, isSuperAdmin, tournamentsController.deleteTournament);

module.exports = router;