import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/workouts?limit=5'),
      api.get('/meals?limit=5'),
      api.get('/progress?limit=30'),
    ])
      .then(([w, m, p]) => {
        setWorkouts(w.data.data);
        setMeals(m.data.data);
        setProgress(p.data.data.slice().reverse());
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = progress
    .filter((p) => p.weightKg)
    .map((p) => ({ date: new Date(p.date).toLocaleDateString(), weight: p.weightKg }));

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <h1>Welcome back, {user.name.split(' ')[0]}</h1>
      <p className="subtitle">Here's a snapshot of your fitness journey</p>

      <div className="card-grid">
        <div className="stat-card">
          <span className="stat-label">Recent Workouts</span>
          <span className="stat-value">{workouts.length}</span>
          <Link to="/workouts">View all →</Link>
        </div>
        <div className="stat-card">
          <span className="stat-label">Recent Meals</span>
          <span className="stat-value">{meals.length}</span>
          <Link to="/meals">View all →</Link>
        </div>
        <div className="stat-card">
          <span className="stat-label">Goal</span>
          <span className="stat-value stat-value-sm">{user.goals?.fitnessGoal?.replace('_', ' ') || 'Not set'}</span>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="chart-card">
          <h2>Weight Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="weight" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="two-col">
        <div className="list-card">
          <h2>Latest Workouts</h2>
          {workouts.length === 0 && <p className="empty">No workouts logged yet.</p>}
          {workouts.map((w) => (
            <div key={w._id} className="list-row">
              <span>{w.title}</span>
              <span className="muted">{new Date(w.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        <div className="list-card">
          <h2>Latest Meals</h2>
          {meals.length === 0 && <p className="empty">No meals logged yet.</p>}
          {meals.map((m) => (
            <div key={m._id} className="list-row">
              <span>{m.mealType}</span>
              <span className="muted">{m.totalCalories} kcal</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
