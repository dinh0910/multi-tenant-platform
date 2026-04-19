import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { Category } from '../../types/post';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.listCategories().then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await adminApi.createCategory({ name, description: description || undefined });
    setName(''); setDescription('');
    load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    await adminApi.deleteCategory(id);
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Categories</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Organize your posts by category.</p>
      </div>

      {/* Create form */}
      <div className="editor-panel" style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Add Category</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} id="add-category-form">
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
            style={{ flex: '1 1 200px' }}
            id="category-name-input"
          />
          <input
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            style={{ flex: '2 1 300px' }}
            id="category-desc-input"
          />
          <button type="submit" className="btn btn-primary" disabled={saving} id="add-category-btn">
            {saving ? 'Adding…' : '+ Add'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>No categories yet.</td></tr>
              ) : categories.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td><code style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)' }}>{c.slug}</code></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{c.description ?? '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
