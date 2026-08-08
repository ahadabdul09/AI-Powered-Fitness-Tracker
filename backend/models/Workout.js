const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number },
    reps: { type: Number },
    weightKg: { type: Number },
    durationMinutes: { type: Number },
    distanceKm: { type: Number },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: { type: String, required: [true, 'Please add a workout title'] },
    type: {
      type: String,
      enum: ['strength', 'cardio', 'flexibility', 'sports', 'other'],
      default: 'strength',
    },
    date: { type: Date, required: true, default: Date.now },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number },
    exercises: [exerciseSchema],
    notes: { type: String },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workoutSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Workout', workoutSchema);
