const express = require('express');
const router = express.Router();
const standingsController = require('../controllers/standingsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', standingsController.getAllStandings);
router.get('/:id', standingsController.getStandingById);
router.post('/', authMiddleware, isAdmin, standingsController.createStanding);
router.put('/:id', authMiddleware, isAdmin, standingsController.updateStanding);
router.delete('/:id', authMiddleware, isAdmin, standingsController.deleteStanding);

module.exports = router;