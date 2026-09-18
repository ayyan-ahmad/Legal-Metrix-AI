import { useState, useEffect, useRef } from 'react';
import {
  Scale, ScanLine, ShieldCheck, BarChart3, FileCheck2,
  Users, ArrowRight, CheckCircle2, Sparkles, Camera,
  Brain, ClipboardCheck, LogIn, ChevronDown, UserCog, ScanFace, ArrowUp,
  Shield, Globe, Activity, Lock, ExternalLink, FileText
} from 'lucide-react';
import boxesBg from '../assets/boxes-bg.png';
import heroBg from '../assets/hero-bg.png';
import verifyBg from '../assets/verify-bg.png';
import AuthModal from '../components/AuthModal';

// ── Reveal on scroll ─────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Feature Card ─────────────────────────────────────────────────
function FeatureCard({ Icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '20px',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 24px rgba(22,36,71,0.08)' : 'none',
        borderColor: hovered ? 'var(--teal)' : 'var(--border)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '9px',
        backgroundColor: 'var(--teal-light)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '12px',
      }}>
        <Icon size={18} color="var(--teal)" strokeWidth={2.2} />
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: '10px',
      backgroundColor: 'var(--surface)', overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = 'inset 0 0 0 2px var(--teal)')}
        onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>{q}</span>
        <ChevronDown size={16} color="var(--muted)" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }} />
      </button>
      <div style={{ maxHeight: open ? '160px' : '0px', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
        <p style={{ padding: '0 18px 16px', fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{a}</p>
      </div>
    </div>
  );
}

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openModal = (mode = 'login') => {
    setModalMode(mode);
    setModalOpen(true);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const navLinkStyle = {
    fontSize: '14px', fontWeight: 600, color: 'var(--navy)', background: 'none',
    border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px',
    transition: 'all 0.2s ease', opacity: 0.85
  };

  // scroll-margin-top zaroori hai taaki sticky navbar section heading ko overlap na kare jab click-scroll ho
  const sectionOffset = { scrollMarginTop: '76px' };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav
        style={{
          height: '68px',
          minHeight: '68px',
          maxHeight: '68px',
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          borderBottom: '1px solid rgba(22, 36, 71, 0.07)',
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.05)',
          position: 'sticky', top: 0, zIndex: 100,
        }}
      >
        <div className="px-5 sm:px-8" style={{
          width: '100%', height: '100%',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              backgroundColor: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Scale size={18} color="var(--teal-light)" strokeWidth={2.3} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.2px' }}>
              LegalMetrix <span style={{ color: 'var(--teal)', fontWeight: 500 }}>AI</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="lp-desktop-nav hidden md:flex" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {['Features', 'How it Works', 'FAQ'].map((item) => (
              <button
                key={item}
                style={navLinkStyle}
                onClick={() => scrollTo(item.toLowerCase().replace(/\s+/g, '-'))}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(22, 36, 71, 0.05)'; e.currentTarget.style.opacity = 1; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.opacity = 0.85; }}
              >
                {item}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="lp-signin-btn"
              onClick={() => openModal('login')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'var(--navy)', color: '#fff', border: '1px solid transparent',
                padding: '9px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(22,36,71,0.15)'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--teal)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,110,86,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--navy)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,36,71,0.15)'; }}
            >
              <span className="lp-signin-text">Sign In</span> <LogIn size={15} />
            </button>

            {/* Hamburger — visible on mobile only */}
            <button
              className="lp-hamburger"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {mobileNavOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <nav className={`lp-mobile-nav${mobileNavOpen ? ' open' : ''}`}>
        {['Features', 'How it Works', 'FAQ'].map((item) => (
          <button
            key={item}
            onClick={() => { scrollTo(item.toLowerCase().replace(/\s+/g, '-')); setMobileNavOpen(false); }}
          >
            {item}
          </button>
        ))}
        <button onClick={() => openModal('register')} style={{ color: 'var(--teal)' }}>
          Register Account
        </button>
      </nav>

      {/* ── Hero (background: hero-bg.png — conveyor scan image) ── */}
      <div
        className="lp-hero-wrap px-5 sm:px-8"
        style={{
          background: `linear-gradient(135deg, rgba(11,25,46,0.88) 0%, rgba(23,44,84,0.82) 55%, rgba(15,110,86,0.85) 100%), url(${heroBg}) center/cover no-repeat`,
          padding: '64px 0 72px', textAlign: 'center', color: '#fff',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: '-70px', right: '-70px', width: '260px', height: '260px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,114,15,0.22) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px',
              borderRadius: '99px', fontSize: '11.5px', fontWeight: 600, marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              <Sparkles size={12} color="var(--teal-light)" />
              AI-Powered Legal Metrology Inspection
            </div>

            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, maxWidth: '620px',
              margin: '0 auto 12px', lineHeight: 1.25, letterSpacing: '-0.4px', color: '#fff',
            }}>
              Scan a label. Get a compliance verdict in seconds.
            </h1>
            <p style={{
              fontSize: '14.5px', color: 'rgba(255,255,255,0.75)', maxWidth: '440px',
              margin: '0 auto 26px', lineHeight: 1.6,
            }}>
              AI-powered label extraction and automated Legal Metrology rule checks —
              no manual checklists.
            </p>

            <div className="lp-hero-ctas" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => openModal('login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backgroundColor: 'var(--amber)', color: '#0b192e', border: 'none',
                  padding: '11px 22px', borderRadius: '9px', fontSize: '13.5px', fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 5px 14px rgba(181,114,15,0.35)',
                }}
              >
                Get Started Free <ArrowRight size={15} />
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '11px 22px', borderRadius: '9px', fontSize: '13.5px', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                See How It Works
              </button>
            </div>
          </Reveal>

          {/* Compact product mockup */}
          <Reveal delay={0.15}>
            <div style={{ maxWidth: '460px', margin: '44px auto 0' }}>
              <div style={{
                backgroundColor: '#fff', borderRadius: '12px', padding: '18px',
                display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left',
                boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>Atta Chakki 5kg</span>
                  <span style={{
                    fontSize: '10.5px', fontWeight: 700, padding: '3px 9px', borderRadius: '99px',
                    backgroundColor: '#FEE2E2', color: '#DC2626',
                  }}>FAIL — 83%</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'MRP', ok: true }, { label: 'Net Qty', ok: true },
                    { label: 'Manufacturer', ok: true }, { label: 'Consumer Care', ok: false },
                  ].map((f) => (
                    <div key={f.label} style={{
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px',
                      padding: '4px 9px', borderRadius: '7px',
                      backgroundColor: f.ok ? '#ECFDF5' : '#FEF2F2',
                      color: f.ok ? '#059669' : '#DC2626', fontWeight: 600,
                    }}>
                      {f.ok ? <CheckCircle2 size={11} /> : <Sparkles size={11} />}
                      {f.label}
                    </div>
                  ))}
                </div>
                <div style={{ height: '5px', backgroundColor: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: '83%', height: '100%', backgroundColor: '#DC2626', borderRadius: '99px' }} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────── */}
      <div className="px-5 sm:px-8" style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '48px',
        padding: '24px 0', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {[
          { value: '5', label: 'Compliance Rules' },
          { value: 'AI', label: 'Vision Extraction' },
          { value: '<30s', label: 'Per Inspection' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--teal)' }}>{s.value}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Role Entry (subtle background: boxes-bg.png) ────────── */}
      <div
        className="px-5 sm:px-8"
        style={{
          padding: '52px 0 12px',
          backgroundImage: `linear-gradient(rgba(255,255,255,0.97), rgba(255,255,255,0.97)), url(${boxesBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--navy)', textAlign: 'center', marginBottom: '6px' }}>
              Built for two roles, one system
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', textAlign: 'center', marginBottom: '22px' }}>
              Pick your role to continue
            </p>
          </Reveal>

          <div className="lp-role-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', alignItems: 'stretch' }}>
            {[
              { Icon: ScanFace, title: 'Compliance Officer', color: 'var(--teal)', bg: 'var(--teal-light)', desc: 'Scan products in the field, get instant verdicts.', cta: 'Continue as Officer' },
              { Icon: UserCog, title: 'System Administrator', color: 'var(--amber)', bg: 'var(--amber-light)', desc: 'Oversee officers, inspections and rules system-wide.', cta: 'Continue as Admin' },
            ].map(({ Icon, title, color, bg, desc, cta }, i) => (
              <Reveal key={title} delay={i * 0.08} style={{ height: '100%' }}>
                <div
                  onClick={() => openModal('login')}
                  style={{
                    backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    height: '100%', boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', backgroundColor: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={19} color={color} strokeWidth={2.2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{desc}</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {cta} <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────── */}
      <div id="features" className="lp-section-wrap px-5 sm:px-8" style={{ ...sectionOffset, padding: '56px 0', maxWidth: '980px', margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--navy)', textAlign: 'center', marginBottom: '28px' }}>
            Everything an inspector needs
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          {[
            { Icon: ScanLine, title: 'Instant Scan', desc: 'Upload a photo, extraction starts immediately.' },
            { Icon: Brain, title: 'AI Extraction', desc: 'Reads MRP, quantity, manufacturer & more.' },
            { Icon: ShieldCheck, title: 'Rule Engine', desc: 'Checked against Legal Metrology Rules 2011.' },
            { Icon: FileCheck2, title: 'PDF Reports', desc: 'Professional report for every inspection.' },
            { Icon: BarChart3, title: 'Live Analytics', desc: 'Compliance trends & violation breakdowns.' },
            { Icon: Users, title: 'Admin Oversight', desc: 'System-wide view of officers and inspections.' },
          ].map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.06}>
              <FeatureCard Icon={Icon} title={title} desc={desc} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── How It Works (background: verify-bg.png — document network) ── */}
      <div id="how-it-works" className="lp-section-wrap px-5 sm:px-8" style={{
        ...sectionOffset,
        background: `linear-gradient(135deg, rgba(11,25,46,0.94) 0%, rgba(15,110,86,0.9) 100%), url(${verifyBg}) center/cover no-repeat`,
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)', padding: '56px 0',
        color: '#fff',
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '28px' }}>
              Three steps from photo to verdict
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { step: '1', Icon: Camera, title: 'Capture', desc: 'Photograph the label, single or bulk.' },
              { step: '2', Icon: Brain, title: 'Analyze', desc: 'AI extracts fields, rule engine validates.' },
              { step: '3', Icon: ClipboardCheck, title: 'Report', desc: 'Verdict + downloadable PDF, instantly.' },
            ].map(({ step, Icon, title, desc }, i) => (
              <Reveal key={step} delay={i * 0.1}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '2px solid var(--teal-light)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 12px', position: 'relative',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <Icon size={22} color="var(--teal-light)" strokeWidth={2} />
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--amber)',
                      color: '#0b192e', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {step}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{title}</h3>
                  <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <div id="faq" className="lp-section-wrap px-5 sm:px-8" style={{ ...sectionOffset, padding: '56px 0', maxWidth: '640px', margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--navy)', textAlign: 'center', marginBottom: '24px' }}>
            Frequently asked questions
          </h2>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { q: 'How accurate is the AI extraction?', a: 'Gemini Vision reads label fields and flags low-confidence results for manual review rather than guessing.' },
            { q: 'Which compliance rules are checked?', a: 'MRP, Net Quantity, Manufacturer, Consumer Care Contact, and Mfg/Packing Date — per the Legal Metrology Rules 2011.' },
            { q: 'Can I scan multiple products at once?', a: 'Yes — bulk scanning handles up to 20 images at once with a consolidated batch report.' },
            { q: 'Is there an audit trail?', a: 'Every inspection is timestamped, linked to the officer, and stored with a downloadable PDF.' },
          ].map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <Reveal>
        <div className="px-5 sm:px-8" style={{ padding: '52px 0 64px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--muted)', marginBottom: '20px' }}>
            Join as an officer or administrator in under a minute.
          </p>
          <button
            onClick={() => openModal('login')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              backgroundColor: 'var(--navy)', color: '#fff', border: 'none',
              padding: '11px 26px', borderRadius: '9px', fontSize: '13.5px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Create Your Account <ArrowRight size={15} />
          </button>
        </div>
      </Reveal>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{
        position: 'relative',
        backgroundColor: '#071322',
        backgroundImage: `linear-gradient(rgba(7,19,34,0.91), rgba(7,19,34,0.91)), url(${boxesBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        color: '#fff',
        paddingTop: '60px',
      }}>
        <div className="px-5 sm:px-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Main Grid: 3 columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '48px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>

            {/* Col 1 — Brand */}
            <div style={{ maxWidth: '340px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '9px',
                  backgroundColor: 'rgba(15,110,86,0.2)', border: '1px solid rgba(52,211,153,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Scale size={18} color="var(--teal-light)" strokeWidth={2.3} />
                </div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                  LegalMetrix <span style={{ color: 'var(--teal-light)', fontWeight: 500 }}>AI</span>
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: '0 0 20px' }}>
                AI-powered Legal Metrology compliance auditing for packaged commodities — built for enforcement officers across India.
              </p>
              <span style={{
                display: 'inline-block', fontSize: '11px', fontWeight: 700,
                padding: '4px 10px', borderRadius: '6px',
                backgroundColor: 'rgba(15,110,86,0.15)', color: 'var(--teal-light)',
                border: '1px solid rgba(52,211,153,0.2)', letterSpacing: '0.3px',
              }}>
                SIH26034
              </span>
            </div>

            {/* Col 2 — Navigation */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.2px', margin: '0 0 20px' }}>
                Navigation
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['Features', 'How it Works', 'FAQ'].map((label) => (
                  <button
                    key={label}
                    onClick={() => scrollTo(label.toLowerCase().replace(/\s+/g, '-'))}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', fontSize: '14px', padding: 0,
                      color: 'rgba(255,255,255,0.55)', fontWeight: 500,
                      transition: 'color 0.18s ease',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Col 3 — Access */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.2px', margin: '0 0 20px' }}>
                Access
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Officer Sign In', action: () => openModal('login') },
                  { label: 'Register Account', action: () => openModal('register') },
                ].map(({ label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', fontSize: '14px', padding: 0,
                      color: 'rgba(255,255,255,0.55)', fontWeight: 500,
                      transition: 'color 0.18s ease',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar — Copyright */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '12px', padding: '22px 0',
          }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
              © 2026 LegalMetrix AI. All rights reserved.
            </span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="var(--teal-light)" />
              Smart India Hackathon · SIH26034
            </span>
          </div>

        </div>
      </footer>

      {/* ── Scroll To Top Button ──────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 99,
          width: '44px', height: '44px', borderRadius: '50%',
          backgroundColor: 'var(--teal)', color: '#fff', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(15,110,86,0.4)', cursor: 'pointer',
          opacity: showTopBtn ? 1 : 0,
          transform: showTopBtn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
          pointerEvents: showTopBtn ? 'auto' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0c5c48'; e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--teal)'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
      >
        <ArrowUp size={20} strokeWidth={2.5} />
      </button>
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultMode={modalMode} />
    </div>
  );
}

export default LandingPage;