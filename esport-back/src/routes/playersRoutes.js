const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', playersController.getAllPlayers);
router.get('/:id', playersController.getPlayerById);
router.post('/', authMiddleware, isAdmin, playersController.createPlayer);
router.put('/:id', authMiddleware, isAdmin, playersController.updatePlayer);
router.delete('/:id', authMiddleware, isAdmin, playersController.deletePlayer);

module.exports = router;