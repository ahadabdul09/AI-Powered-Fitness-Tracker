import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    heightCm: '',
    fitnessGoal: 'maintain',
    activityLevel: 'moderate',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        goals: {
          fitnessGoal: form.fitnessGoal,
          activityLevel: form.activityLevel,
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="subtitle">Start tracking workouts, meals & progress</p>
        {error && <div className="alert-error">{error}</div>}
        <label>Name</label>
        <input value={form.name} onChange={update('name')} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={update('email')} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={update('password')} required minLength={6} />
        <label>Height (cm)</label>
        <input type="number" value={form.heightCm} onChange={update('heightCm')} />
        <label>Fitness Goal</label>
        <select value={form.fitnessGoal} onChange={update('fitnessGoal')}>
          <option value="lose_weight">Lose weight</option>
          <option value="gain_muscle">Gain muscle</option>
          <option value="maintain">Maintain</option>
          <option value="improve_endurance">Improve endurance</option>
        </select>
        <label>Activity Level</label>
        <select value={form.activityLevel} onChange={update('activityLevel')}>
          <option value="sedentary">Sedentary</option>
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="active">Active</option>
          <option value="very_active">Very active</option>
        </select>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
