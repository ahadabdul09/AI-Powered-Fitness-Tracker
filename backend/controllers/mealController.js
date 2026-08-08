const asyncHandler = require('express-async-handler');
const Meal = require('../models/Meal');

// @desc    Get all meals for logged-in user
// @route   GET /api/meals
// @access  Private
const getMeals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, from, to, mealType } = req.query;

  const query = { user: req.user._id };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }
  if (mealType) query.mealType = mealType;

  const meals = await Meal.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Meal.countDocuments(query);

  res.json({
    success: true,
    count: meals.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: meals,
  });
});

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Private
const getMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }
  res.json({ success: true, data: meal });
});

// @desc    Create meal
// @route   POST /api/meals
// @access  Private
const createMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: meal });
});

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = asyncHandler(async (req, res) => {
  let meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }

  Object.assign(meal, req.body);
  await meal.save(); // triggers pre-save calorie calculation

  res.json({ success: true, data: meal });
});

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
  if (!meal) {
    res.status(404);
    throw new Error('Meal not found');
  }
  await meal.deleteOne();
  res.json({ success: true, data: {} });
});

module.exports = { getMeals, getMeal, createMeal, updateMeal, deleteMeal };
