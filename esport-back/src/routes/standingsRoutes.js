const express = require('express');
const router = express.Router();
const standingsController = require('../controllers/standingsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');

router.get('/', standingsController.getAllStandings);
router.get('/:id', standingsController.getStandingById);
router.post('/', authMiddleware, isSuperAdmin, standingsController.createStanding);
router.put('/:id', authMiddleware, isSuperAdmin, standingsController.updateStanding);
router.delete('/:id', authMiddleware, isSuperAdmin, standingsController.deleteStanding);

module.exports = router;