import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = {
  mealType: 'breakfast',
  date: new Date().toISOString().slice(0, 10),
  foodItems: [{ name: '', quantity: '', calories: '' }],
  notes: '',
};

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchMeals = () => {
    setLoading(true);
    api
      .get('/meals')
      .then((res) => setMeals(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchMeals, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setForm({
      mealType: m.mealType,
      date: new Date(m.date).toISOString().slice(0, 10),
      foodItems: m.foodItems.length ? m.foodItems : [{ name: '', quantity: '', calories: '' }],
      notes: m.notes || '',
    });
    setEditingId(m._id);
    setShowForm(true);
  };

  const updateFoodItem = (idx, field, value) => {
    const items = [...form.foodItems];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, foodItems: items });
  };

  const addFoodItem = () =>
    setForm({ ...form, foodItems: [...form.foodItems, { name: '', quantity: '', calories: '' }] });

  const removeFoodItem = (idx) =>
    setForm({ ...form, foodItems: form.foodItems.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      mealType: form.mealType,
      date: form.date,
      notes: form.notes,
      foodItems: form.foodItems
        .filter((f) => f.name)
        .map((f) => ({ ...f, calories: Number(f.calories) || 0 })),
    };
    try {
      if (editingId) {
        await api.put(`/meals/${editingId}`, payload);
      } else {
        await api.post('/meals', payload);
      }
      setShowForm(false);
      fetchMeals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save meal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this meal?')) return;
    await api.delete(`/meals/${id}`);
    fetchMeals();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Meals</h1>
        <button className="btn-primary" onClick={openNew}>+ Log Meal</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : meals.length === 0 ? (
        <p className="empty">No meals yet. Log your first one!</p>
      ) : (
        <div className="table-card">
          {meals.map((m) => (
            <div key={m._id} className="table-row">
              <div>
                <strong style={{ textTransform: 'capitalize' }}>{m.mealType}</strong>
                <div className="muted">{new Date(m.date).toLocaleDateString()} · {m.totalCalories} kcal{m.aiGenerated ? ' · AI' : ''}</div>
              </div>
              <div className="row-actions">
                <button className="btn-outline" onClick={() => openEdit(m)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(m._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingId ? 'Edit Meal' : 'Log Meal'}</h2>
            {error && <div className="alert-error">{error}</div>}
            <label>Meal Type</label>
            <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />

            <label>Food Items</label>
            {form.foodItems.map((item, idx) => (
              <div key={idx} className="food-item-row">
                <input placeholder="Name" value={item.name} onChange={(e) => updateFoodItem(idx, 'name', e.target.value)} />
                <input placeholder="Qty" value={item.quantity} onChange={(e) => updateFoodItem(idx, 'quantity', e.target.value)} />
                <input placeholder="Calories" type="number" value={item.calories} onChange={(e) => updateFoodItem(idx, 'calories', e.target.value)} />
                <button type="button" className="btn-danger-sm" onClick={() => removeFoodItem(idx)}>×</button>
              </div>
            ))}
            <button type="button" className="btn-outline" onClick={addFoodItem}>+ Add food item</button>

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
