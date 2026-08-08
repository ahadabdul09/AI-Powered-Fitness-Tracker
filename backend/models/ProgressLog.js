const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: { type: Date, required: true, default: Date.now },
    weightKg: { type: Number },
    bodyFatPercent: { type: Number },
    measurements: {
      chestCm: { type: Number },
      waistCm: { type: Number },
      hipsCm: { type: Number },
      armsCm: { type: Number },
      thighsCm: { type: Number },
    },
    notes: { type: String },
  },
  { timestamps: true }
);

progressLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('ProgressLog', progressLogSchema);
