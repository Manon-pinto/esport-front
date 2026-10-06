const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', matchesController.getAllMatches);
router.get('/:id', matchesController.getMatchById);
router.post('/', authMiddleware, isAdmin, matchesController.createMatch);
router.put('/:id', authMiddleware, isAdmin, matchesController.updateMatch);
router.delete('/:id', authMiddleware, isAdmin, matchesController.deleteMatch);

module.exports = router;