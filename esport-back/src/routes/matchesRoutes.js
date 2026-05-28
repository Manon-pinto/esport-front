const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');

router.get('/', matchesController.getAllMatches);
router.get('/:id', matchesController.getMatchById);
router.post('/', authMiddleware, isSuperAdmin, matchesController.createMatch);
router.put('/:id', authMiddleware, isSuperAdmin, matchesController.updateMatch);
router.delete('/:id', authMiddleware, isSuperAdmin, matchesController.deleteMatch);

module.exports = router;