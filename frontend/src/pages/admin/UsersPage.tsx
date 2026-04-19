import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { User } from '../../types/user';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'tenant_admin' | 'author'>('author');
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.listUsers().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await adminApi.createUser({ email, full_name: name, password, role });
    setEmail(''); setName(''); setPassword(''); setRole('author');
    setShowForm(false);
    load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user? This is irreversible.')) return;
    await adminApi.deleteUser(id);
    load();
  };

  const roleColor = (r: string) => {
    if (r === 'super_admin') return 'badge-danger';
    if (r === 'tenant_admin') return 'badge-primary';
    return 'badge-success';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Users</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" id="invite-user-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Invite User'}
        </button>
      </div>

      {showForm && (
        <div className="editor-panel" style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Invite New User</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} id="invite-user-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required id="user-name-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required id="user-email-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required id="user-password-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value as typeof role)} id="user-role-select">
                <option value="author">Author</option>
                <option value="tenant_admin">Tenant Admin</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} id="create-user-btn">
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem' }}>No users yet.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.full_name}</strong></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{u.email}</td>
                  <td><span className={`badge ${roleColor(u.role)}`}>{u.role.replace('_', ' ')}</span></td>
                  <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
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
