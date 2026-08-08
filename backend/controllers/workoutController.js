const asyncHandler = require('express-async-handler');
const Workout = require('../models/Workout');

// @desc    Get all workouts for logged-in user (supports pagination & date filter)
// @route   GET /api/workouts
// @access  Private
const getWorkouts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, from, to, type } = req.query;

  const query = { user: req.user._id };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }
  if (type) query.type = type;

  const workouts = await Workout.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Workout.countDocuments(query);

  res.json({
    success: true,
    count: workouts.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: workouts,
  });
});

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  res.json({ success: true, data: workout });
});

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: workout });
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = asyncHandler(async (req, res) => {
  let workout = await Workout.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: workout });
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  await workout.deleteOne();
  res.json({ success: true, data: {} });
});

module.exports = {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
