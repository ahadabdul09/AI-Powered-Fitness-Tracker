import { useState } from 'react';
import api from '../api/axios';

export default function AICoach() {
  const [tab, setTab] = useState('workout');

  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [focusAreas, setFocusAreas] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState(null);

  const [targetCalories, setTargetCalories] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [nutritionNotes, setNutritionNotes] = useState('');
  const [nutrition, setNutrition] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateWorkoutPlan = async () => {
    setLoading(true);
    setError('');
    setWorkoutPlan(null);
    try {
      const res = await api.post('/ai/workout-plan', {
        daysPerWeek: Number(daysPerWeek),
        focusAreas: focusAreas.split(',').map((s) => s.trim()).filter(Boolean),
        notes: workoutNotes,
      });
      setWorkoutPlan(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate plan. Check your LLM API key on the server.');
    } finally {
      setLoading(false);
    }
  };

  const generateNutrition = async () => {
    setLoading(true);
    setError('');
    setNutrition(null);
    try {
      const res = await api.post('/ai/nutrition-suggestions', {
        targetCalories: targetCalories ? Number(targetCalories) : undefined,
        dietaryRestrictions: dietaryRestrictions.split(',').map((s) => s.trim()).filter(Boolean),
        notes: nutritionNotes,
      });
      setNutrition(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate suggestions. Check your LLM API key on the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>AI Coach</h1>
      <p className="subtitle">Get a personalized workout plan or nutrition suggestions powered by an LLM</p>

      <div className="tabs">
        <button className={tab === 'workout' ? 'tab active' : 'tab'} onClick={() => setTab('workout')}>Workout Plan</button>
        <button className={tab === 'nutrition' ? 'tab active' : 'tab'} onClick={() => setTab('nutrition')}>Nutrition</button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {tab === 'workout' && (
        <div className="ai-panel">
          <div className="ai-form">
            <label>Days per week</label>
            <input type="number" min={1} max={7} value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} />
            <label>Focus areas (comma-separated)</label>
            <input placeholder="e.g. upper body, core" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} />
            <label>Notes for the coach</label>
            <textarea rows={3} value={workoutNotes} onChange={(e) => setWorkoutNotes(e.target.value)} placeholder="e.g. bad knee, only dumbbells at home" />
            <button className="btn-primary" onClick={generateWorkoutPlan} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Workout Plan'}
            </button>
          </div>

          {workoutPlan && (
            <div className="ai-result">
              <h2>{workoutPlan.planTitle}</h2>
              <p>{workoutPlan.summary}</p>
              {workoutPlan.days?.map((d, i) => (
                <div key={i} className="plan-day">
                  <h3>{d.day} — {d.focus}</h3>
                  <ul>
                    {d.exercises?.map((ex, j) => (
                      <li key={j}>
                        {ex.name} — {ex.sets}×{ex.reps} {ex.restSeconds ? `(rest ${ex.restSeconds}s)` : ''}
                        {ex.notes ? <span className="muted"> — {ex.notes}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {workoutPlan.cautionNotes && <p className="caution">⚠ {workoutPlan.cautionNotes}</p>}
            </div>
          )}
        </div>
      )}

      {tab === 'nutrition' && (
        <div className="ai-panel">
          <div className="ai-form">
            <label>Target daily calories (optional)</label>
            <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} />
            <label>Dietary restrictions (comma-separated)</label>
            <input placeholder="e.g. vegetarian, no dairy" value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} />
            <label>Notes for the coach</label>
            <textarea rows={3} value={nutritionNotes} onChange={(e) => setNutritionNotes(e.target.value)} placeholder="e.g. prefer high protein, busy schedule" />
            <button className="btn-primary" onClick={generateNutrition} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Suggestions'}
            </button>
          </div>

          {nutrition && (
            <div className="ai-result">
              <h2>Daily Target: {nutrition.dailyCalorieTarget} kcal</h2>
              <p>{nutrition.summary}</p>
              <p className="muted">
                Protein: {nutrition.macroSplit?.proteinG}g · Carbs: {nutrition.macroSplit?.carbsG}g · Fat: {nutrition.macroSplit?.fatG}g
              </p>
              {nutrition.suggestedMeals?.map((m, i) => (
                <div key={i} className="plan-day">
                  <h3 style={{ textTransform: 'capitalize' }}>{m.mealType} (~{m.approxCalories} kcal)</h3>
                  <ul>
                    {m.ideas?.map((idea, j) => <li key={j}>{idea}</li>)}
                  </ul>
                </div>
              ))}
              {nutrition.generalTips?.length > 0 && (
                <div className="plan-day">
                  <h3>General Tips</h3>
                  <ul>{nutrition.generalTips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
