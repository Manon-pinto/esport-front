const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');

router.get('/', teamsController.getAllTeams);
router.get('/:id', teamsController.getTeamById);
router.post('/', authMiddleware, isSuperAdmin, teamsController.createTeam);
router.put('/:id', authMiddleware, isSuperAdmin, teamsController.updateTeam);
router.delete('/:id', authMiddleware, isSuperAdmin, teamsController.deleteTeam);

module.exports = router;