import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/admin.css';

const navItems = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/posts', icon: '📝', label: 'Posts' },
  { to: '/admin/categories', icon: '📁', label: 'Categories' },
  { to: '/admin/tags', icon: '🏷️', label: 'Tags' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">⚡ CMS Admin</div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>{user?.full_name}</strong>
            <br />
            <span style={{ textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%' }}
            id="admin-logout-btn"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
