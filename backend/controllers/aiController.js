const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const ProgressLog = require('../models/ProgressLog');
const { generateAIResponse } = require('../utils/llmClient');

// @desc    Generate a personalized workout plan using LLM, based on user goals + recent history
// @route   POST /api/ai/workout-plan
// @access  Private
const generateWorkoutPlan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const recentWorkouts = await Workout.find({ user: req.user._id })
    .sort({ date: -1 })
    .limit(10);

  const { daysPerWeek = 3, focusAreas = [], notes = '' } = req.body;

  const systemPrompt = `You are a certified fitness coach AI. You generate safe, effective, personalized workout plans.
Always respond with STRICT JSON only, matching this shape, and nothing else (no markdown fences, no preamble):
{
  "planTitle": string,
  "summary": string,
  "days": [
    {
      "day": string,
      "focus": string,
      "exercises": [
        { "name": string, "sets": number, "reps": number, "restSeconds": number, "notes": string }
      ]
    }
  ],
  "cautionNotes": string
}`;

  const userPrompt = `Generate a ${daysPerWeek}-day/week workout plan for this user.

User profile:
- Fitness goal: ${user.goals?.fitnessGoal || 'maintain'}
- Activity level: ${user.goals?.activityLevel || 'moderate'}
- Height (cm): ${user.heightCm || 'unknown'}
- Focus areas requested: ${focusAreas.join(', ') || 'none specified'}
- Additional notes from user: ${notes || 'none'}

Recent workout history (most recent first, up to 10):
${recentWorkouts
  .map(
    (w) =>
      `- ${w.date.toISOString().slice(0, 10)}: ${w.title} (${w.type}, ${w.durationMinutes} min)`
  )
  .join('\n') || 'No prior workouts logged.'}

Generate a plan appropriate for this user's level. Respond with JSON only.`;

  const aiText = await generateAIResponse({ systemPrompt, userPrompt });

  let plan;
  try {
    const cleaned = aiText.replace(/```json|```/g, '').trim();
    plan = JSON.parse(cleaned);
  } catch (err) {
    res.status(502);
    throw new Error('AI response could not be parsed. Please try again.');
  }

  res.json({ success: true, data: plan });
});

// @desc    Generate personalized nutrition suggestions using LLM
// @route   POST /api/ai/nutrition-suggestions
// @access  Private
const generateNutritionSuggestions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const recentMeals = await Meal.find({ user: req.user._id })
    .sort({ date: -1 })
    .limit(15);
  const latestProgress = await ProgressLog.findOne({
    user: req.user._id,
  }).sort({ date: -1 });

  const { targetCalories, dietaryRestrictions = [], notes = '' } = req.body;

  const systemPrompt = `You are a certified nutrition coach AI. You generate safe, practical, personalized meal/nutrition suggestions.
You are not a doctor and must not give medical advice. Always respond with STRICT JSON only, matching this shape, and nothing else (no markdown fences, no preamble):
{
  "summary": string,
  "dailyCalorieTarget": number,
  "macroSplit": { "proteinG": number, "carbsG": number, "fatG": number },
  "suggestedMeals": [
    { "mealType": string, "ideas": [string], "approxCalories": number }
  ],
  "generalTips": [string]
}`;

  const userPrompt = `Generate nutrition suggestions for this user.

User profile:
- Fitness goal: ${user.goals?.fitnessGoal || 'maintain'}
- Activity level: ${user.goals?.activityLevel || 'moderate'}
- Latest logged weight (kg): ${latestProgress?.weightKg || 'unknown'}
- Target daily calories (if specified by user): ${targetCalories || 'not specified, estimate a reasonable target'}
- Dietary restrictions: ${dietaryRestrictions.join(', ') || 'none specified'}
- Additional notes: ${notes || 'none'}

Recent meals logged (most recent first, up to 15):
${recentMeals
  .map(
    (m) =>
      `- ${m.date.toISOString().slice(0, 10)} ${m.mealType}: ${m.totalCalories} kcal`
  )
  .join('\n') || 'No meals logged yet.'}

Respond with JSON only.`;

  const aiText = await generateAIResponse({ systemPrompt, userPrompt });

  let suggestions;
  try {
    const cleaned = aiText.replace(/```json|```/g, '').trim();
    suggestions = JSON.parse(cleaned);
  } catch (err) {
    res.status(502);
    throw new Error('AI response could not be parsed. Please try again.');
  }

  res.json({ success: true, data: suggestions });
});

module.exports = { generateWorkoutPlan, generateNutritionSuggestions };
