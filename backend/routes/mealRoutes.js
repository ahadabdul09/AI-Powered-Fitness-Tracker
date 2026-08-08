const express = require('express');
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
} = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getMeals).post(createMeal);
router.route('/:id').get(getMeal).put(updateMeal).delete(deleteMeal);

module.exports = router;
