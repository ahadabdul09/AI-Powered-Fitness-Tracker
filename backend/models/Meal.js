const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String },
    calories: { type: Number, required: true },
    proteinG: { type: Number, default: 0 },
    carbsG: { type: Number, default: 0 },
    fatG: { type: Number, default: 0 },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    foodItems: [foodItemSchema],
    totalCalories: { type: Number, default: 0 },
    notes: { type: String },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mealSchema.index({ user: 1, date: -1 });

// Auto-calculate total calories before saving
mealSchema.pre('save', function (next) {
  if (this.foodItems && this.foodItems.length > 0) {
    this.totalCalories = this.foodItems.reduce(
      (sum, item) => sum + (item.calories || 0),
      0
    );
  }
  next();
});

module.exports = mongoose.model('Meal', mealSchema);
