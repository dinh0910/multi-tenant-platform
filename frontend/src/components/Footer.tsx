import { useTenant } from '../contexts/TenantContext';

export default function Footer() {
  const { tenant } = useTenant();
  const siteName = tenant?.seo_defaults?.site_name ?? 'Blog Platform';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <p>© {year} {siteName}. Built with ❤️ — Multi-Tenant Blog Platform.</p>
      </div>
    </footer>
  );
}
