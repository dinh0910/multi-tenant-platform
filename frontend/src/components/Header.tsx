import { Link } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';

export default function Header() {
  const { tenant } = useTenant();
  const siteName = tenant?.seo_defaults?.site_name ?? 'Blog';

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="site-logo">
          {tenant?.logo
            ? <img src={tenant.logo} alt={siteName} style={{ height: 36 }} />
            : siteName
          }
        </Link>
        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/blog">Blog</Link>
        </nav>
      </div>
    </header>
  );
}
