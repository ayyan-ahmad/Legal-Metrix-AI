import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle, Loader2, Mail, Lock, User,
  ShieldCheck, Eye, EyeOff, ArrowRight,
  UserPlus, LogIn, X,
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Sync defaultMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError('');
      setSuccess('');
      setEmail('');
      setPassword('');
      setName('');
      setRole('');
    }
  }, [isOpen, defaultMode]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setRole('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await API.post('/auth/login', { email, password });
        login(response.data.user, response.data.token);
        onClose();
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        await API.post('/auth/register', { name, email, password, role });
        setSuccess('Registration successful! Logging you in...');
        const loginRes = await API.post('/auth/login', { email, password });
        setTimeout(() => {
          login(loginRes.data.user, loginRes.data.token);
          onClose();
          if (loginRes.data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 800);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(11,25,46,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeInOverlay 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpModal { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
      width: '100%', maxWidth: '440px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(11,25,46,0.35)',
          overflow: 'hidden',
          animation: 'slideUpModal 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >

        {/* ── Form Panel ─────────────────────────── */}
        <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--muted)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            <X size={15} />
          </button>

          {/* Mode Switcher */}
          <div style={{
            display: 'flex', backgroundColor: 'var(--bg)', padding: '4px',
            borderRadius: '11px', border: '1px solid var(--border)', marginBottom: '24px',
          }}>
            {[
              { key: 'login', label: 'Sign In', Icon: LogIn },
              { key: 'register', label: 'Register', Icon: UserPlus },
            ].map(({ key, label, Icon: Ic }) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                style={{
                  flex: 1, border: 'none', padding: '8px',
                  borderRadius: '8px', fontSize: '13px',
                  fontWeight: mode === key ? 700 : 500,
                  backgroundColor: mode === key ? 'var(--surface)' : 'transparent',
                  color: mode === key ? 'var(--navy)' : 'var(--muted)',
                  cursor: 'pointer',
                  boxShadow: mode === key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <Ic size={14} /> {label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '4px', marginBottom: 0 }}>
              {mode === 'login'
                ? 'Enter your credentials to access the inspection system'
                : 'Sign up for access to LegalMetrix AI Inspector portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full Name */}
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '5px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Inspector Rajesh Kumar" required
                    style={{ width: '100%', padding: '10px 11px 10px 34px', borderRadius: '9px', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--ink)', backgroundColor: 'var(--surface)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '5px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <input id="modal-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@legalmetrix.ai" required
                  style={{ width: '100%', padding: '10px 11px 10px 34px', borderRadius: '9px', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--ink)', backgroundColor: 'var(--surface)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Role */}
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '5px' }}>System Role</label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={15} color="var(--muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select value={role} onChange={(e) => setRole(e.target.value)} required
                    style={{ width: '100%', padding: '10px 11px 10px 34px', borderRadius: '9px', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--ink)', backgroundColor: 'var(--surface)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                    <option value="" disabled>Select Role</option>
                    <option value="officer">Compliance Officer</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '5px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <input id="modal-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: '100%', padding: '10px 36px 10px 34px', borderRadius: '9px', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--ink)', backgroundColor: 'var(--surface)', outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)44', borderRadius: '8px', padding: '9px 12px', color: 'var(--danger)', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
                <AlertCircle size={15} strokeWidth={2} /> {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{ backgroundColor: 'var(--teal-light)', border: '1px solid var(--teal)44', borderRadius: '8px', padding: '9px 12px', color: 'var(--teal)', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
                <CheckCircle2 size={15} strokeWidth={2} /> {success}
              </div>
            )}

            {/* Submit */}
            <button
              id="modal-auth-submit"
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? 'var(--muted)' : 'var(--navy)', color: '#fff',
                border: 'none', borderRadius: '9px', padding: '12px',
                fontSize: '13.5px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease', marginTop: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(22,36,71,0.2)',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--teal)'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--navy)'; }}
            >
              {loading ? (
                <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  {mode === 'login' ? 'Signing in…' : 'Creating Account…'}</>
              ) : (
                <>{mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Bottom switcher */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: 'var(--muted)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Register here
                </button>
              </>
            ) : (
              <>Already registered?{' '}
                <button type="button" onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
