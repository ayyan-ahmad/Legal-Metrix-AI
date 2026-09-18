import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  Users, ClipboardCheck, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, ShieldCheck, Sparkles, ArrowUpRight, ChevronRight,
  BarChart3, Activity, RefreshCw, Settings,
} from 'lucide-react';

// ── Reusable StatCard (same premium design as officer Dashboard) ──────────────
function StatCard({ count, label, subtext, borderColor, bgColor, textColor, Icon, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="p-4 sm:p-[22px_24px] flex flex-col gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 180px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderTop: `4px solid ${borderColor}`,
        borderRadius: '16px',
        boxShadow: hovered ? '0 8px 24px rgba(22,36,71,0.12)' : '0 2px 10px rgba(22,36,71,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <div className="flex justify-between items-start">
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          backgroundColor: borderColor + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={22} color={textColor} strokeWidth={2.2} />
        </div>
        {badge !== undefined && (
          <span style={{
            fontSize: '12px', fontWeight: 700,
            padding: '3px 10px', borderRadius: '99px',
            backgroundColor: borderColor + '18',
            color: textColor, whiteSpace: 'nowrap',
          }}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl sm:text-[34px]" style={{ fontWeight: 800, color: textColor, margin: 0, lineHeight: 1.1 }}>
          {count}
        </h3>
        <p className="text-xs sm:text-[14px]" style={{ color: 'var(--ink)', fontWeight: 600, marginTop: '6px', margin: 0 }}>
          {label}
        </p>
        {subtext && (
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', margin: 0 }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/analytics/stats');
      setAnalyticsData(res.data);
    } catch (err) {
      // silent fail — charts optional hain, poora page nahi todna
    }
  };

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await API.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────────
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
          Loading Admin Overview...
        </p>
      </div>
    );
  }

  if (error) return <p style={{ color: '#F87171', padding: '20px' }}>{error}</p>;

  // ── Derived data ────────────────────────────────────────────────────────────
  const total = stats.totalInspections;
  const compRate = stats.compliancePercentage;
  const rateColor = compRate >= 75 ? 'var(--teal)' : compRate >= 50 ? 'var(--amber)' : 'var(--danger)';
  const rateBg = compRate >= 75 ? 'var(--teal-light)' : compRate >= 50 ? 'var(--amber-light)' : 'var(--danger-light)';

  return (
    <div style={{ paddingBottom: '40px' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

      {/* ── Hero Header Banner ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-5 p-6 md:p-[32px_36px] mb-7" style={{
        background: 'linear-gradient(135deg, #0b192e 0%, #162a45 60%, #7c4a00 100%)',
        borderRadius: '20px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(22,36,71,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background radial glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(181,114,15,0.28) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 14px',
            borderRadius: '99px', fontSize: '12px', fontWeight: 600,
            marginBottom: '12px', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}>
            <Sparkles size={13} color="var(--amber-light)" />
            System Admin Control Panel
          </div>
          <h1 className="text-2xl md:text-[28px]" style={{ fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
            Admin Overview
          </h1>
          <p className="text-sm md:text-[14px]" style={{ color: 'rgba(255,255,255,0.78)', marginTop: '6px', margin: 0, maxWidth: '520px' }}>
            Full-system visibility — inspections, officers, compliance health and rule management.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap w-full md:w-auto relative z-10">
          <button
            onClick={() => navigate('/admin/inspections')}
            className="flex items-center justify-center sm:justify-start gap-[7px] w-full sm:w-auto px-5 py-[11px]"
            style={{
              backgroundColor: 'var(--amber)', color: '#0b192e',
              border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(181,114,15,0.45)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <ClipboardCheck size={17} />
            All Inspections
            <ArrowUpRight size={15} />
          </button>

          <button
            onClick={() => navigate('/admin/officers')}
            className="flex items-center justify-center sm:justify-start gap-[7px] w-full sm:w-auto px-5 py-[11px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '10px', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
          >
            <Users size={17} />
            Manage Officers
          </button>

          <button
            onClick={() => fetchStats(true)}
            title="Refresh Stats"
            className="flex items-center justify-center sm:justify-start w-full sm:w-auto px-[14px] py-[11px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px', cursor: 'pointer',
              backdropFilter: 'blur(4px)', transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-7">
        <StatCard
          count={total}
          label="Total Inspections"
          subtext="All-time system scans"
          borderColor="var(--navy)"
          bgColor="var(--surface)"
          textColor="var(--navy)"
          Icon={ClipboardCheck}
        />
        <StatCard
          count={stats.totalOfficers}
          label="Active Officers"
          subtext="Field inspection team"
          borderColor="#7C3AED"
          bgColor="#F5F3FF"
          textColor="#7C3AED"
          Icon={Users}
        />
        <StatCard
          count={stats.passed}
          label="Fully Compliant"
          subtext="All mandatory rules met"
          borderColor="var(--teal)"
          bgColor="var(--teal-light)"
          textColor="var(--teal)"
          Icon={CheckCircle2}
          badge={total > 0 ? `${Math.round((stats.passed / total) * 100)}%` : '—'}
        />
        <StatCard
          count={stats.failed}
          label="Non-Compliant"
          subtext="Violations flagged"
          borderColor="var(--danger)"
          bgColor="var(--danger-light)"
          textColor="var(--danger)"
          Icon={XCircle}
          badge={total > 0 ? `${Math.round((stats.failed / total) * 100)}%` : '—'}
        />
        <StatCard
          count={stats.review}
          label="Under Review"
          subtext="Requires human audit"
          borderColor="var(--amber)"
          bgColor="var(--amber-light)"
          textColor="var(--amber)"
          Icon={AlertTriangle}
          badge={total > 0 ? `${Math.round((stats.review / total) * 100)}%` : '—'}
        />
      </div>

      {/* ── Main Dashboard Content Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7 items-start">

        {/* LEFT COLUMN (Wider - Spans 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Health Bar */}
          {total > 0 && (
            <div className="p-5 sm:p-[24px_28px] w-full" style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
            }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-[8px] mb-4">
                <span className="text-[14px] sm:text-[15px] flex items-center gap-[8px]" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                  <TrendingUp size={18} color="var(--teal)" strokeWidth={2.2} />
                  System-wide Compliance Health
                </span>
                <span className="text-xs sm:text-[14px] px-3 py-1 sm:px-[14px] sm:py-1 rounded-full font-extrabold self-start sm:self-auto" style={{
                  color: rateColor, backgroundColor: rateBg,
                }}>
                  {compRate}% Compliance Rate
                </span>
              </div>

              {/* Segmented Progress Bar */}
              <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--bg)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', padding: '2px', gap: '2px' }}>
                {stats.passed > 0 && (
                  <div style={{ flex: stats.passed, backgroundColor: 'var(--teal)', borderRadius: '99px', transition: 'flex 0.8s cubic-bezier(0.4,0,0.2,1)' }} title={`Pass: ${stats.passed}`} />
                )}
                {stats.review > 0 && (
                  <div style={{ flex: stats.review, backgroundColor: 'var(--amber)', borderRadius: '99px', transition: 'flex 0.8s cubic-bezier(0.4,0,0.2,1)' }} title={`Review: ${stats.review}`} />
                )}
                {stats.failed > 0 && (
                  <div style={{ flex: stats.failed, backgroundColor: 'var(--danger)', borderRadius: '99px', transition: 'flex 0.8s cubic-bezier(0.4,0,0.2,1)' }} title={`Fail: ${stats.failed}`} />
                )}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Compliant', color: 'var(--teal)', count: stats.passed },
                  { label: 'Review', color: 'var(--amber)', count: stats.review },
                  { label: 'Violations', color: 'var(--danger)', count: stats.failed },
                ].map(({ label, color, count }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                      {label}: <strong style={{ color: 'var(--ink)' }}>{count}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Violations by Category BarChart */}
          {analyticsData && (
            <div style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="var(--navy)" strokeWidth={2.2} />
                Violations Frequency (All Officers)
              </h4>

              {!analyticsData.violationBreakdown || analyticsData.violationBreakdown.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                  No violations recorded across the system. 🎉
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={310}>
                  <BarChart data={analyticsData.violationBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 55 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="field" stroke="var(--muted)" fontSize={11} tickLine={false} angle={-35} textAnchor="end" interval={0} tick={{ fill: 'var(--ink)', fontWeight: 600 }} />
                    <YAxis allowDecimals={false} stroke="var(--muted)" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                    <Bar dataKey="count" fill="#2A5298" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Narrower - Spans 1 col) */}
        <div className="flex flex-col gap-6">
          {/* Compliance Distribution PieChart */}
          {analyticsData && (
            <div style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
              flex: 1,
              display: 'flex', flexDirection: 'column'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieIcon size={18} color="var(--teal)" strokeWidth={2.2} />
                System-wide Compliance Distribution
              </h4>

              {!analyticsData || analyticsData.total === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No inspection data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280} style={{ flex: 1 }}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Compliant', value: analyticsData.passed },
                        { name: 'Non-Compliant', value: analyticsData.failed },
                        { name: 'Under Review', value: analyticsData.review },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {['#0F6E56', '#A32D2D', '#B5720F'].map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="flex flex-col gap-2.5 p-5 w-full" style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Quick Navigation
            </span>
            {[
              { label: 'All Inspections', Icon: ClipboardCheck, path: '/admin/inspections', color: 'var(--teal)' },
              { label: 'Officers', Icon: Users, path: '/admin/officers', color: '#7C3AED' },
              { label: 'Manage Rules', Icon: Settings, path: '/admin/rules', color: 'var(--amber)' },

            ].map(({ label, Icon: Ic, path, color }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '10px', padding: '12px 14px',
                  backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: '10px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, color: 'var(--ink)',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.backgroundColor = color + '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.backgroundColor = 'var(--bg)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Ic size={16} color={color} />
                  {label}
                </div>
                <ChevronRight size={14} color="var(--muted)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── System Status Footer ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-3 p-4 sm:p-[18px_24px]" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
      }}>
        <div className="flex items-center gap-[10px]">
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: '#22C55E',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
          }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
            All Systems Operational
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'AI Engine', status: 'Active', color: 'var(--teal)', Icon: Activity },
            { label: 'Rule Engine', status: 'Active', color: 'var(--teal)', Icon: ShieldCheck },
          ].map(({ label, status, color, Icon: Ic }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ic size={14} color={color} />
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{label}:</span>
              <span style={{ fontSize: '12px', color, fontWeight: 700 }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
