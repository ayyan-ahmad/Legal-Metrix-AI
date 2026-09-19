import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Toast from './Toast';
import { Scale, LayoutDashboard, ScanLine, History, BarChart3, Settings, LogOut, User, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/scan', label: 'Scan Product', Icon: ScanLine },
  { to: '/history', label: 'History', Icon: History },
  { to: '/analytics', label: 'Analytics', Icon: BarChart3 },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const prevStatusMap = useRef({}); // { inspectionId: submissionStatus } — pichli poll ki value yaad rakhta hai

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const addToast = (toast) => setToasts((prev) => [...prev, { ...toast, id: Date.now() + Math.random() }]);
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Apni submissions ka status poll karo — jab approve/sent_back ho, toast dikhao
  useEffect(() => {
    const checkMySubmissions = async () => {
      try {
        const res = await API.get('/inspections');
        res.data.forEach((insp) => {
          const prevStatus = prevStatusMap.current[insp._id];
          const currentStatus = insp.submission?.status;

          // Pehli baar hai to bas map mein daal do, notify mat karo (warna page load pe purani saari notify ho jaayengi)
          if (prevStatus === undefined) {
            prevStatusMap.current[insp._id] = currentStatus;
            return;
          }

          if (prevStatus !== currentStatus) {
            if (currentStatus === 'approved') {
              addToast({
                type: 'success',
                title: 'Submission Approved',
                message: `${insp.productName} — Case ${insp.submission.caseNumber} approved by admin.`,
              });
            } else if (currentStatus === 'sent_back') {
              addToast({
                type: 'error',
                title: 'Sent Back for Correction',
                message: `${insp.productName}: ${insp.submission.adminRemarks || 'Please review and resubmit.'}`,
              });
            }
            prevStatusMap.current[insp._id] = currentStatus;
          }
        });
      } catch {
        // Silent fail — notification optional feature hai, poore navbar ko todna nahi
      }
    };

    checkMySubmissions();
    const interval = setInterval(checkMySubmissions, 15000); // har 15 second
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        style={{
          backgroundColor: 'var(--navy)',
          borderBottom: '2px solid var(--teal)',
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
            to="/dashboard"
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
            <Scale size={20} color="var(--teal)" strokeWidth={2.2} />
            LegalMetrix <span style={{ color: 'var(--teal)', fontWeight: 500 }}>AI</span>
          </Link>

          {/* Desktop Links (md:flex) */}
          <div className="hidden md:flex" style={{ gap: '4px', flex: 1, alignItems: 'center' }}>
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

          {/* Mobile Hamburger Toggle Button */}
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
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Drawer / Dropdown */}
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
            {NAV_LINKS.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                style={{
                  color: isActive(to) ? 'var(--teal-light)' : 'rgba(255,255,255,0.85)',
                  fontWeight: isActive(to) ? 600 : 400,
                  fontSize: '15px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: isActive(to) ? 'rgba(15,110,86,0.22)' : 'transparent',
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

            {user?.role === 'admin' && (
              <Link
                to="/rules"
                style={{
                  color: isActive('/rules') ? 'var(--amber-light)' : 'rgba(255,255,255,0.85)',
                  fontWeight: isActive('/rules') ? 600 : 400,
                  fontSize: '15px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: isActive('/rules') ? 'rgba(181,114,15,0.22)' : 'transparent',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Settings size={18} strokeWidth={2} />
                Manage Rules
              </Link>
            )}

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
                <span style={{ color: 'var(--teal-light)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                  {user?.role}
                </span>
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

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default Navbar;