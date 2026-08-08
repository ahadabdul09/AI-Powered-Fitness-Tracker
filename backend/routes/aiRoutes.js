const express = require('express');
const {
  generateWorkoutPlan,
  generateNutritionSuggestions,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/workout-plan', generateWorkoutPlan);
router.post('/nutrition-suggestions', generateNutritionSuggestions);

module.exports = router;
