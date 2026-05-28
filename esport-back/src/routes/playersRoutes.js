const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');

router.get('/', playersController.getAllPlayers);
router.get('/:id', playersController.getPlayerById);
router.post('/', authMiddleware, isSuperAdmin, playersController.createPlayer);
router.put('/:id', authMiddleware, isSuperAdmin, playersController.updatePlayer);
router.delete('/:id', authMiddleware, isSuperAdmin, playersController.deletePlayer);

module.exports = router;