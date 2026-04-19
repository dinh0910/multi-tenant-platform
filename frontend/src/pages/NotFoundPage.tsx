import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="404 — Page Not Found" />
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '1rem', lineHeight: 1 }}>404</div>
        <h1 style={{ marginBottom: '1rem' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">← Go Home</Link>
      </div>
    </>
  );
}
