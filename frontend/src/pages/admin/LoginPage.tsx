import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SEOHead from '../../components/SEOHead';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/posts');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Admin Login" />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%), var(--color-bg)',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚡</div>
            <h1 style={{ fontSize: '1.75rem' }}>Admin Login</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Sign in to your CMS dashboard</p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} id="admin-login-form">
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: 'var(--color-danger)',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                id="login-submit-btn"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
