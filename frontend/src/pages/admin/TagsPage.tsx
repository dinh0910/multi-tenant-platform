import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { Tag } from '../../types/post';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.listTags().then(setTags).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await adminApi.createTag({ name });
    setName('');
    load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this tag?')) return;
    await adminApi.deleteTag(id);
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Tags</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Label your posts with relevant topics.</p>
      </div>

      <div className="editor-panel" style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Add Tag</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem' }} id="add-tag-form">
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            required
            id="tag-name-input"
          />
          <button type="submit" className="btn btn-primary" disabled={saving} id="add-tag-btn">
            {saving ? 'Adding…' : '+ Add'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {tags.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No tags yet.</p>
          ) : tags.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: '99px', padding: '0.4rem 1rem',
              }}
            >
              <span style={{ fontWeight: 500 }}>#{t.name}</span>
              <button
                onClick={() => handleDelete(t.id)}
                style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '1rem', lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none' }}
                aria-label={`Delete tag ${t.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
