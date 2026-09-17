import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Users, ShieldCheck, Mail, Calendar, Activity, ChevronRight,
  UserCircle2, Search, X, ClipboardList, CheckCircle2, XCircle,
  AlertTriangle, ArrowUpRight, TrendingUp,
} from 'lucide-react';

function OfficerDrawer({ officer, onClose, onViewInspections }) {
  const isHighPerformer = officer.passRate >= 70;
  const isWarning = officer.passRate < 40;
  const rateColor = isHighPerformer ? 'var(--teal)' : isWarning ? 'var(--danger)' : 'var(--amber)';
  const rateBg = isHighPerformer ? 'var(--teal-light)' : isWarning ? 'var(--danger-light)' : 'var(--amber-light)';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(11,25,46,0.45)',
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
        width: '380px', maxWidth: '95vw',
        backgroundColor: 'var(--surface)',
        boxShadow: '-8px 0 40px rgba(11,25,46,0.18)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>

        {/* Drawer Header */}
        <div className="p-5 sm:p-[28px_24px]" style={{
          background: 'linear-gradient(135deg, #0b192e 0%, #162a45 60%, #7c4a00 100%)',
          color: '#FFFFFF', position: 'relative', flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF', borderRadius: '8px', padding: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="shrink-0 flex items-center justify-center" style={{
              width: '60px', height: '60px', borderRadius: '16px',
              backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)',
            }}>
              <UserCircle2 size={32} color="var(--amber-light)" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{officer.name}</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                backgroundColor: 'rgba(255,255,255,0.12)', padding: '2px 10px',
                borderRadius: '99px', fontSize: '11px', fontWeight: 600, marginTop: '4px',
              }}>
                <ShieldCheck size={11} color="var(--amber-light)" />
                Field Officer
              </div>
            </div>
          </div>

          {/* 3 mini stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total Scans', value: officer.totalScans, color: '#FFFFFF' },
              { label: 'Passed', value: officer.passedScans, color: '#5EEAD4' },
              { label: 'Pass Rate', value: `${officer.passRate}%`, color: isHighPerformer ? '#5EEAD4' : isWarning ? '#FCA5A5' : '#FCD34D' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-2 sm:p-[10px_12px] text-center rounded-[10px]" style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <div className="text-base sm:text-[18px] font-extrabold" style={{ color }}>{value}</div>
                <div className="text-[9px] sm:text-[10px] font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-[24px] flex flex-col gap-4 sm:gap-5 flex-1">

          {/* Officer Info */}
          <div className="flex flex-col gap-3 p-4 rounded-xl" style={{
            backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contact Info
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--ink)' }}>
              <Mail size={15} color="var(--muted)" />
              <span>{officer.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--ink)' }}>
              <Calendar size={15} color="var(--muted)" />
              <span>Joined: {new Date(officer.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--ink)' }}>
              <ShieldCheck size={15} color="var(--muted)" />
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>ID: {officer._id}</span>
            </div>
          </div>

          {/* Performance Health Bar */}
          <div style={{
            backgroundColor: 'var(--bg)', borderRadius: '12px',
            border: '1px solid var(--border)', padding: '16px',
          }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
                <TrendingUp size={15} color={rateColor} />
                Performance Health
              </div>
              <span className="text-[11px] sm:text-[12px] font-extrabold px-2.5 py-0.5 rounded-full" style={{
                color: rateColor, backgroundColor: rateBg,
              }}>
                {isHighPerformer ? 'High Performer' : isWarning ? 'Needs Attention' : 'Moderate'}
              </span>
            </div>

            {/* Segmented bar */}
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--surface)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', gap: '2px', padding: '2px' }}>
              {officer.passedScans > 0 && (
                <div style={{ flex: officer.passedScans, backgroundColor: 'var(--teal)', borderRadius: '99px' }} title={`Passed: ${officer.passedScans}`} />
              )}
              {(officer.totalScans - officer.passedScans) > 0 && (
                <div style={{ flex: (officer.totalScans - officer.passedScans), backgroundColor: isWarning ? 'var(--danger)' : 'var(--amber)', borderRadius: '99px' }} title={`Failed/Review: ${officer.totalScans - officer.passedScans}`} />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { label: 'Passed', color: 'var(--teal)', count: officer.passedScans },
                { label: 'Others', color: isWarning ? 'var(--danger)' : 'var(--amber)', count: officer.totalScans - officer.passedScans },
              ].map(({ label, color, count }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{label}: <strong style={{ color: 'var(--ink)' }}>{count}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { label: 'Passed', value: officer.passedScans, Icon: CheckCircle2, color: 'var(--teal)', bg: 'var(--teal-light)' },
              { label: 'Others', value: officer.totalScans - officer.passedScans, Icon: XCircle, color: 'var(--danger)', bg: 'var(--danger-light)' },
              { label: 'Total', value: officer.totalScans, Icon: ClipboardList, color: 'var(--navy)', bg: 'var(--bg)' },
            ].map(({ label, value, Icon, color, bg }) => (
              <div key={label} className="p-3 rounded-[10px] flex flex-col items-center gap-1.5" style={{
                backgroundColor: bg,
                border: `1px solid ${color}33`,
              }}>
                <Icon size={18} color={color} />
                <div className="text-lg sm:text-[20px] font-extrabold" style={{ color }}>{value}</div>
                <div className="text-[10px] sm:text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer Footer: CTA Button */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0,
        }}>
          <button
            onClick={() => onViewInspections(officer)}
            className="w-full p-3 sm:p-[13px] rounded-xl flex items-center justify-center gap-2 font-bold text-sm"
            style={{
              backgroundColor: 'var(--amber)', color: '#0b192e',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(181,114,15,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Activity size={17} />
            View All Inspections by {officer.name.split(' ')[0]}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
function AdminOfficers() {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  useEffect(() => { fetchOfficers(); }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/officers');
      setOfficers(res.data.officers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInspections = (officer) => {
    navigate('/admin/inspections', { state: { officerFilter: officer._id, officerName: officer.name } });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 20px', gap: '16px',
      }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--amber)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--muted)', margin: 0 }}>
          Loading Field Officers...
        </p>
      </div>
    );
  }

  if (error) return <p style={{ color: '#F87171', padding: '20px' }}>{error}</p>;

  const filteredOfficers = officers.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '40px' }}>

      {/* Drawer */}
      {selectedOfficer && (
        <OfficerDrawer
          officer={selectedOfficer}
          onClose={() => setSelectedOfficer(null)}
          onViewInspections={handleViewInspections}
        />
      )}

      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-5 p-6 md:p-[32px_36px] mb-7" style={{
        background: 'linear-gradient(135deg, #0b192e 0%, #162a45 60%, #7c4a00 100%)',
        borderRadius: '20px', color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(22,36,71,0.2)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,114,15,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border" style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(4px)', borderColor: 'rgba(255,255,255,0.18)',
          }}>
            <ShieldCheck size={13} color="var(--amber-light)" />
            Personnel Management
          </div>
          <h1 className="text-2xl md:text-[28px]" style={{ fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
            Admin Overview
          </h1>
          <p className="text-sm md:text-[14px] m-0 max-w-[520px] mt-1.5" style={{ color: 'rgba(255,255,255,0.78)' }}>
            Manage your field inspection team. View performance, stats, and full inspection history.
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 sm:p-[14px_24px] w-full md:w-auto relative z-10" style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
        }}>
          <div>
            <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Active Personnel
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Users size={20} color="var(--amber-light)" />
              <span className="text-[20px] sm:text-[24px] font-extrabold leading-none">{officers.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', boxShadow: '0 2px 10px rgba(22,36,71,0.04)', overflow: 'hidden',
      }}>
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-3 p-4 sm:p-[20px_24px]" style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#FCFDFD',
        }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>Officer Directory</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0 0' }}>
              Click <strong>Details</strong> to view full profile and inspection history
            </p>
          </div>
          <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[240px]">
            <Search size={15} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                borderRadius: '8px', border: '1px solid var(--border)',
                fontSize: '13px', outline: 'none', backgroundColor: 'var(--bg)',
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Officer', 'Contact', 'Total Scans', 'Pass Rate', 'Joined Date', 'Actions'].map((h, i) => (
                  <th key={h} style={{ ...thStyle, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <Users size={36} color="var(--border)" style={{ marginBottom: '12px', display: 'inline-block' }} />
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                      {officers.length === 0 ? 'No officers registered yet' : 'No matching officers found'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer, idx) => {
                  const isHighPerformer = officer.passRate >= 70;
                  const isWarning = officer.passRate < 40;
                  return (
                    <tr
                      key={officer._id}
                      style={{
                        borderBottom: idx < filteredOfficers.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background-color 0.15s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div className="shrink-0 flex items-center justify-center" style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            backgroundColor: 'var(--amber-light)', border: '1px solid var(--amber)',
                          }}>
                            <UserCircle2 size={22} color="var(--amber)" strokeWidth={2} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{officer.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                              #{officer._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ink)' }}>
                          <Mail size={14} color="var(--muted)" /> {officer.email}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <Activity size={14} color="var(--navy)" />
                          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--navy)' }}>{officer.totalScans}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          backgroundColor: isHighPerformer ? 'var(--teal-light)' : isWarning ? 'var(--danger-light)' : 'var(--amber-light)',
                          color: isHighPerformer ? 'var(--teal)' : isWarning ? 'var(--danger)' : 'var(--amber)',
                          padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                        }}>
                          {officer.passRate}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          {new Date(officer.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedOfficer(officer)}
                          style={{
                            backgroundColor: 'transparent', border: '1px solid var(--border)',
                            padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                            fontWeight: 600, color: 'var(--navy)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--navy)'; e.currentTarget.style.color = '#FFF'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--navy)'; }}
                        >
                          Details <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 24px', fontSize: '12px',
  fontWeight: 700, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default AdminOfficers;
