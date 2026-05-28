const express = require('express');
const router = express.Router();
const coachesController = require('../controllers/coachesController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperAdmin } = require('../middlewares/roleMiddleware');

router.get('/', coachesController.getAllCoaches);
router.get('/:id', coachesController.getCoachById);
router.post('/', authMiddleware, isSuperAdmin, coachesController.createCoach);
router.put('/:id', authMiddleware, isSuperAdmin, coachesController.updateCoach);
router.delete('/:id', authMiddleware, isSuperAdmin, coachesController.deleteCoach);

module.exports = router;