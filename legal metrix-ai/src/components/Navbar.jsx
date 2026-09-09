import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, LayoutDashboard, ScanLine, History, BarChart3, Settings, LogOut, User } from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/scan',      label: 'Scan Product', Icon: ScanLine },
  { to: '/history',   label: 'History',      Icon: History },
  { to: '/analytics', label: 'Analytics',    Icon: BarChart3 },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'var(--navy)',
      borderBottom: '2px solid var(--teal)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(22,36,71,0.18)',
    }}>
      {/* Brand */}
      <span style={{
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: '18px',
        letterSpacing: '0.3px',
        marginRight: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Scale size={20} color="var(--teal)" strokeWidth={2.2} />
        LegalMetrix <span style={{ color: 'var(--teal)', fontWeight: 500 }}>AI</span>
      </span>

      {/* Links */}
      <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            style={{
              color: isActive(to) ? 'var(--teal-light)' : 'rgba(255,255,255,0.78)',
              fontWeight: isActive(to) ? 600 : 400,
              fontSize: '14px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: isActive(to) ? 'rgba(15,110,86,0.18)' : 'transparent',
              borderBottom: isActive(to) ? '2px solid var(--teal)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
          </Link>
        ))}

        {user?.role === 'admin' && (
          <Link
            to="/rules"
            style={{
              color: isActive('/rules') ? 'var(--amber-light)' : 'rgba(255,255,255,0.78)',
              fontWeight: isActive('/rules') ? 600 : 400,
              fontSize: '14px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: isActive('/rules') ? 'rgba(181,114,15,0.18)' : 'transparent',
              borderBottom: isActive('/rules') ? '2px solid var(--amber)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Settings size={15} strokeWidth={2} />
            Manage Rules
          </Link>
        )}
      </div>

      {/* User info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: '13px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '4px 10px',
          borderRadius: '99px',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <User size={13} strokeWidth={2} />
          {user?.name}
          <span style={{ color: 'var(--teal-light)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
            {user?.role}
          </span>
        </span>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid rgba(163,45,45,0.6)',
            color: '#F87171',
            padding: '5px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.18s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(163,45,45,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={14} strokeWidth={2} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;