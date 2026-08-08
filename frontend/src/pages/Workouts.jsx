import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  title: '',
  type: 'strength',
  date: new Date().toISOString().slice(0, 10),
  durationMinutes: '',
  caloriesBurned: '',
  notes: '',
};

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchWorkouts = () => {
    setLoading(true);
    api
      .get('/workouts')
      .then((res) => setWorkouts(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchWorkouts, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (w) => {
    setForm({
      title: w.title,
      type: w.type,
      date: new Date(w.date).toISOString().slice(0, 10),
      durationMinutes: w.durationMinutes,
      caloriesBurned: w.caloriesBurned || '',
      notes: w.notes || '',
    });
    setEditingId(w._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      caloriesBurned: form.caloriesBurned ? Number(form.caloriesBurned) : undefined,
    };
    try {
      if (editingId) {
        await api.put(`/workouts/${editingId}`, payload);
      } else {
        await api.post('/workouts', payload);
      }
      setShowForm(false);
      fetchWorkouts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workout');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workout?')) return;
    await api.delete(`/workouts/${id}`);
    fetchWorkouts();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Workouts</h1>
        <button className="btn-primary" onClick={openNew}>+ Log Workout</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : workouts.length === 0 ? (
        <p className="empty">No workouts yet. Log your first one!</p>
      ) : (
        <div className="table-card">
          {workouts.map((w) => (
            <div key={w._id} className="table-row">
              <div>
                <strong>{w.title}</strong>
                <div className="muted">{w.type} · {new Date(w.date).toLocaleDateString()} · {w.durationMinutes} min{w.aiGenerated ? ' · AI' : ''}</div>
              </div>
              <div className="row-actions">
                <button className="btn-outline" onClick={() => openEdit(w)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(w._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingId ? 'Edit Workout' : 'Log Workout'}</h2>
            {error && <div className="alert-error">{error}</div>}
            <label>Title</label>
            <input value={form.title} onChange={update('title')} required />
            <label>Type</label>
            <select value={form.type} onChange={update('type')}>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
            <label>Date</label>
            <input type="date" value={form.date} onChange={update('date')} required />
            <label>Duration (minutes)</label>
            <input type="number" value={form.durationMinutes} onChange={update('durationMinutes')} required />
            <label>Calories Burned</label>
            <input type="number" value={form.caloriesBurned} onChange={update('caloriesBurned')} />
            <label>Notes</label>
            <textarea value={form.notes} onChange={update('notes')} rows={3} />
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
