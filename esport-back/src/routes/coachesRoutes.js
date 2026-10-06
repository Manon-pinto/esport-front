const express = require('express');
const router = express.Router();
const coachesController = require('../controllers/coachesController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/', coachesController.getAllCoaches);
router.get('/:id', coachesController.getCoachById);
router.post('/', authMiddleware, isAdmin, coachesController.createCoach);
router.put('/:id', authMiddleware, isAdmin, coachesController.updateCoach);
router.delete('/:id', authMiddleware, isAdmin, coachesController.deleteCoach);

module.exports = router;