import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  weightKg: '',
  bodyFatPercent: '',
  notes: '',
};

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    api
      .get('/progress')
      .then((res) => setLogs(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchLogs, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/progress', {
        date: form.date,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        bodyFatPercent: form.bodyFatPercent ? Number(form.bodyFatPercent) : undefined,
        notes: form.notes,
      });
      setShowForm(false);
      setForm(emptyForm);
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save log');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await api.delete(`/progress/${id}`);
    fetchLogs();
  };

  const chartData = logs
    .filter((l) => l.weightKg)
    .slice()
    .reverse()
    .map((l) => ({ date: new Date(l.date).toLocaleDateString(), weight: l.weightKg }));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Progress</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Log Entry</button>
      </div>

      {chartData.length > 1 && (
        <div className="chart-card">
          <h2>Weight Over Time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
              <Line type="monotone" dataKey="weight" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : logs.length === 0 ? (
        <p className="empty">No progress logs yet.</p>
      ) : (
        <div className="table-card">
          {logs.map((l) => (
            <div key={l._id} className="table-row">
              <div>
                <strong>{new Date(l.date).toLocaleDateString()}</strong>
                <div className="muted">
                  {l.weightKg ? `${l.weightKg} kg` : ''}
                  {l.bodyFatPercent ? ` · ${l.bodyFatPercent}% BF` : ''}
                </div>
              </div>
              <div className="row-actions">
                <button className="btn-danger" onClick={() => handleDelete(l._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>Log Progress</h2>
            {error && <div className="alert-error">{error}</div>}
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <label>Weight (kg)</label>
            <input type="number" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
            <label>Body Fat (%)</label>
            <input type="number" step="0.1" value={form.bodyFatPercent} onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })} />
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
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
