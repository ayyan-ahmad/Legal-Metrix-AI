import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Scale, LayoutDashboard, Users, ClipboardList, Settings, LogOut, User, Menu, X } from 'lucide-react';

const ADMIN_NAV_LINKS = [
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard },
  { to: '/admin/officers', label: 'Officers', Icon: Users },
  { to: '/admin/inspections', label: 'All Inspections', Icon: ClipboardList },
  { to: '/rules', label: 'Manage Rules', Icon: Settings },
];

function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        backgroundColor: 'var(--navy)',
        borderBottom: '2px solid var(--amber)', // Admin ko thoda visually alag rakhne ke liye amber border (teal ki jagah)
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(22,36,71,0.18)',
      }}
      className="px-4 sm:px-8"
    >
      <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {/* Brand */}
        <Link
          to="/admin"
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.3px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '16px',
          }}
        >
          <Scale size={20} color="var(--amber)" strokeWidth={2.2} />
          LegalMetrix <span style={{ color: 'var(--amber)', fontWeight: 500 }}>Admin</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex" style={{ gap: '4px', flex: 1, alignItems: 'center' }}>
          {ADMIN_NAV_LINKS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                color: isActive(to) ? 'var(--amber-light)' : 'rgba(255,255,255,0.78)',
                fontWeight: isActive(to) ? 600 : 400,
                fontSize: '14px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: isActive(to) ? 'rgba(181,114,15,0.18)' : 'transparent',
                borderBottom: isActive(to) ? '2px solid var(--amber)' : '2px solid transparent',
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
        </div>

        {/* Desktop User info + logout */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '12px' }}>
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
            <span style={{ color: 'var(--amber-light)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#FFFFFF',
            padding: '8px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="block md:hidden"
          style={{
            backgroundColor: 'var(--navy)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '16px 0 20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {ADMIN_NAV_LINKS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                color: isActive(to) ? 'var(--amber-light)' : 'rgba(255,255,255,0.85)',
                fontWeight: isActive(to) ? 600 : 400,
                fontSize: '15px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: isActive(to) ? 'rgba(181,114,15,0.22)' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          ))}

          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <span style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '13px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '6px 12px',
              borderRadius: '99px',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <User size={14} strokeWidth={2} />
              {user?.name}
            </span>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(163,45,45,0.15)',
                border: '1px solid rgba(163,45,45,0.6)',
                color: '#F87171',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <LogOut size={15} strokeWidth={2} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default AdminNavbar;
