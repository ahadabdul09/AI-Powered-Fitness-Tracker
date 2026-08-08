const asyncHandler = require('express-async-handler');
const ProgressLog = require('../models/ProgressLog');

// @desc    Get all progress logs for logged-in user
// @route   GET /api/progress
// @access  Private
const getProgressLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, from, to } = req.query;

  const query = { user: req.user._id };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const logs = await ProgressLog.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await ProgressLog.countDocuments(query);

  res.json({
    success: true,
    count: logs.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: logs,
  });
});

// @desc    Create progress log
// @route   POST /api/progress
// @access  Private
const createProgressLog = asyncHandler(async (req, res) => {
  const log = await ProgressLog.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: log });
});

// @desc    Update progress log
// @route   PUT /api/progress/:id
// @access  Private
const updateProgressLog = asyncHandler(async (req, res) => {
  let log = await ProgressLog.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!log) {
    res.status(404);
    throw new Error('Progress log not found');
  }

  log = await ProgressLog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: log });
});

// @desc    Delete progress log
// @route   DELETE /api/progress/:id
// @access  Private
const deleteProgressLog = asyncHandler(async (req, res) => {
  const log = await ProgressLog.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!log) {
    res.status(404);
    throw new Error('Progress log not found');
  }
  await log.deleteOne();
  res.json({ success: true, data: {} });
});

module.exports = {
  getProgressLogs,
  createProgressLog,
  updateProgressLog,
  deleteProgressLog,
};
