const express = require('express');
const router = express.Router();
const betsController = require('../controllers/betsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, betsController.getAllBets);
router.get('/:id', authMiddleware, betsController.getBetById);
router.post('/', authMiddleware, betsController.createBet);
router.delete('/:id', authMiddleware, betsController.cancelBet);

module.exports = router;