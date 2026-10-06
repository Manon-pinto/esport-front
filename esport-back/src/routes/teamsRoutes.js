const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', teamsController.getAllTeams);
router.get('/:id', teamsController.getTeamById);
router.post('/', authMiddleware, isAdmin, teamsController.createTeam);
router.put('/:id', authMiddleware, isAdmin, teamsController.updateTeam);
router.delete('/:id', authMiddleware, isAdmin, teamsController.deleteTeam);

module.exports = router;