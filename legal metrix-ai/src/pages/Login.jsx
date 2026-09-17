import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Scale,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';

function Login() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
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
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Register mode
        await API.post('/auth/register', { name, email, password, role });
        setSuccess('Registration successful! Logging you in...');
        
        // Auto login after registration
        const loginRes = await API.post('/auth/login', { email, password });
        setTimeout(() => {
          login(loginRes.data.user, loginRes.data.token);
          if (loginRes.data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 800);
      }
    } catch (err) {
      setError(err.response?.data?.message || (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
      background: 'radial-gradient(circle at 50% 10%, #E8F4F0 0%, var(--bg) 70%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: '0 16px 48px rgba(22,36,71,0.12)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      }}>
        {/* ── Left Side: Brand Hero Showcase ─────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #172c54 50%, #0F6E56 100%)',
          padding: '40px 36px',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle background ring */}
          <div style={{
            position: 'absolute', right: '-60px', top: '-60px', width: '240px', height: '240px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none'
          }} />

          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{
                width: '46px', height: '46px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Scale size={24} color="var(--teal-light)" strokeWidth={2.2} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                LegalMetrix <span style={{ color: 'var(--teal-light)', fontWeight: 500 }}>AI</span>
              </h1>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1.3, marginBottom: '12px', color: '#FFFFFF' }}>
              AI-Powered Legal Metrology Compliance
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginBottom: '28px' }}>
              Automated packaged commodity inspection, OCR label parsing, and mandatory declaration audit engine.
            </p>

            {/* Feature Check List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Instant Packaging OCR', desc: 'Auto-extract MRP, Net Qty & Mfr details' },
                { title: 'Legal Metrology Rules', desc: '5 mandatory declaration compliance checks' },
                { title: 'Official Audit Trail', desc: 'Digital logs & inspection evidence history' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    backgroundColor: 'rgba(15,110,86,0.4)', border: '1px solid var(--teal-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
                  }}>
                    <CheckCircle2 size={14} color="var(--teal-light)" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{f.title}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)',
            fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Sparkles size={14} color="var(--teal-light)" />
            Government & Enterprise Grade Security
          </div>
        </div>

        {/* ── Right Side: Mode Switcher & Form ──────────────── */}
        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            marginBottom: '28px',
          }}>
            <button
              onClick={() => switchMode('login')}
              style={{
                flex: 1,
                border: 'none',
                padding: '9px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: mode === 'login' ? 700 : 500,
                backgroundColor: mode === 'login' ? 'var(--surface)' : 'transparent',
                color: mode === 'login' ? 'var(--navy)' : 'var(--muted)',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <LogIn size={15} />
              Sign In
            </button>

            <button
              onClick={() => switchMode('register')}
              style={{
                flex: 1,
                border: 'none',
                padding: '9px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: mode === 'register' ? 700 : 500,
                backgroundColor: mode === 'register' ? 'var(--surface)' : 'transparent',
                color: mode === 'register' ? 'var(--navy)' : 'var(--muted)',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={15} />
              Register
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', margin: 0 }}>
              {mode === 'login'
                ? 'Enter your credentials to access the inspection system'
                : 'Sign up for access to LegalMetrix AI Inspector portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name (Register mode only) */}
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Inspector Rajesh Kumar"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      color: 'var(--ink)',
                      backgroundColor: 'var(--surface)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@legalmetrix.ai"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    color: 'var(--ink)',
                    backgroundColor: 'var(--surface)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Role (Register mode only) */}
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  System Role
                </label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      color: 'var(--ink)',
                      backgroundColor: 'var(--surface)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled selected hidden>Select Role</option>
                    <option value="officer">Compliance Officer</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 36px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    color: 'var(--ink)',
                    backgroundColor: 'var(--surface)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger)44',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--danger)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertCircle size={16} strokeWidth={2} />
                {error}
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div style={{
                backgroundColor: 'var(--teal-light)',
                border: '1px solid var(--teal)44',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--teal)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <CheckCircle2 size={16} strokeWidth={2} />
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? 'var(--muted)' : 'var(--navy)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(22,36,71,0.2)',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--teal)'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--navy)'; }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  {mode === 'login' ? 'Signing in…' : 'Creating Account…'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In to Dashboard' : 'Register Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher Helper */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--muted)' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
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

export default Login;
