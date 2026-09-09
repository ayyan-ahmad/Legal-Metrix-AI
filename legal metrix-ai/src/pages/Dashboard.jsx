import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  TrendingUp,
  ScanLine,
  History,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Package,
} from 'lucide-react';

function StatCard({ count, label, subtext, borderColor, bgColor, textColor, Icon, percentage }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 210px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderTop: `4px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: hovered
          ? '0 8px 24px rgba(22,36,71,0.12)'
          : '0 2px 10px rgba(22,36,71,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: borderColor + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={22} color={textColor} strokeWidth={2.2} />
        </div>
        {percentage !== undefined && (
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '99px',
            backgroundColor: borderColor + '18',
            color: textColor,
          }}>
            {percentage}%
          </span>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '34px', fontWeight: 800, color: textColor, margin: 0, lineHeight: 1.1 }}>
          {count}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600, marginTop: '6px', margin: 0 }}>
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

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, inspRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/inspections'),
      ]);
      setStats(statsRes.data);
      setInspections(inspRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = stats?.total || 0;
  const passed = stats?.passed || 0;
  const failed = stats?.failed || 0;
  const review = stats?.review || 0;

  const complianceRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const rateColor = complianceRate >= 75 ? 'var(--teal)' : complianceRate >= 50 ? 'var(--amber)' : 'var(--danger)';
  const rateBg = complianceRate >= 75 ? 'var(--teal-light)' : complianceRate >= 50 ? 'var(--amber-light)' : 'var(--danger-light)';

  const filteredInspections = inspections.filter((item) => {
    const matchesSearch = item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item._id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pass':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            backgroundColor: 'var(--teal-light)', color: 'var(--teal)',
            padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            border: '1px solid var(--teal)33'
          }}>
            <CheckCircle2 size={13} strokeWidth={2.5} /> COMPLIANT
          </span>
        );
      case 'fail':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
            padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            border: '1px solid var(--danger)33'
          }}>
            <XCircle size={13} strokeWidth={2.5} /> VIOLATION
          </span>
        );
      case 'review':
      default:
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            backgroundColor: 'var(--amber-light)', color: 'var(--amber)',
            padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            border: '1px solid var(--amber)33'
          }}>
            <AlertTriangle size={13} strokeWidth={2.5} /> NEEDS REVIEW
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px', gap: '16px', color: 'var(--muted)'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--teal)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: 500, fontSize: '15px' }}>Loading Legal Metrix Overview Dashboard…</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* ── 1. Hero Header Banner ────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1a2c56 60%, #0F6E56 100%)',
        borderRadius: '20px',
        padding: '32px 36px',
        color: '#FFFFFF',
        marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(22,36,71,0.18)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, marginBottom: '12px', backdropFilter: 'blur(4px)' }}>
            <Sparkles size={13} color="var(--teal-light)" />
            Legal Metrology AI Engine Active
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.4px' }}>
            Compliance Overview
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', marginTop: '6px', margin: 0, maxWidth: '520px' }}>
            Real-time packaged product verification against Indian Legal Metrology Rules & Standards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/scan')}
            style={{
              backgroundColor: 'var(--teal)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 22px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15,110,86,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <ScanLine size={18} />
            Scan New Product
            <ArrowUpRight size={16} />
          </button>

          <button
            onClick={() => navigate('/history')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '12px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
          >
            <History size={18} />
            Audit History
          </button>
        </div>
      </div>

      {/* ── 2. Stat Cards Grid ──────────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <StatCard
          count={total}
          label="Total Products Scanned"
          subtext="Cumulative inspections"
          borderColor="var(--navy)"
          bgColor="var(--surface)"
          textColor="var(--navy)"
          Icon={ClipboardList}
        />
        <StatCard
          count={passed}
          label="Fully Compliant"
          subtext="All mandatory rules met"
          borderColor="var(--teal)"
          bgColor="var(--teal-light)"
          textColor="var(--teal)"
          Icon={CheckCircle2}
          percentage={total > 0 ? Math.round((passed / total) * 100) : 0}
        />
        <StatCard
          count={failed}
          label="Non-Compliant"
          subtext="Violations flagged"
          borderColor="var(--danger)"
          bgColor="var(--danger-light)"
          textColor="var(--danger)"
          Icon={XCircle}
          percentage={total > 0 ? Math.round((failed / total) * 100) : 0}
        />
        <StatCard
          count={review}
          label="Needs Review"
          subtext="Requires human audit"
          borderColor="var(--amber)"
          bgColor="var(--amber-light)"
          textColor="var(--amber)"
          Icon={AlertTriangle}
          percentage={total > 0 ? Math.round((review / total) * 100) : 0}
        />
      </div>

      {/* ── 3. Compliance Health Bar ────────────────────────── */}
      {total > 0 && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
          marginBottom: '32px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--teal)" strokeWidth={2.2} />
              Overall System Compliance Health
            </span>
            <span style={{
              fontSize: '16px', fontWeight: 800, color: rateColor,
              backgroundColor: rateBg, padding: '4px 12px', borderRadius: '99px',
            }}>
              {complianceRate}% Compliance Rate
            </span>
          </div>

          <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg)', borderRadius: '99px', overflow: 'hidden', padding: '2px', border: '1px solid var(--border)' }}>
            <div style={{
              height: '100%',
              width: `${complianceRate}%`,
              backgroundColor: rateColor,
              borderRadius: '99px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        </div>
      )}

      {/* ── 4. Recent Inspections Table ───────────────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
        overflow: 'hidden',
      }}>
        {/* Table Controls */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#FCFDFD',
        }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
              Recent Product Scans
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0 0' }}>
              Latest inspection logs and AI verification status
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search input */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: 'var(--surface)',
                }}
              />
            </div>

            {/* Status Filter Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'pass', label: 'Pass' },
                { id: 'fail', label: 'Fail' },
                { id: 'review', label: 'Review' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: statusFilter === tab.id ? 700 : 500,
                    backgroundColor: statusFilter === tab.id ? 'var(--surface)' : 'transparent',
                    color: statusFilter === tab.id ? 'var(--navy)' : 'var(--muted)',
                    cursor: 'pointer',
                    boxShadow: statusFilter === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Body */}
        {filteredInspections.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            <Package size={36} color="var(--border)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              {total === 0 ? 'No inspections created yet' : 'No matching inspections found'}
            </p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              {total === 0 ? 'Click "Scan New Product" above to create your first inspection.' : 'Try adjusting your search query or status filter.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Violations</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInspections.slice(0, 8).map((item, idx) => (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: idx < filteredInspections.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'backgroundColor 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.productName}
                            style={{
                              width: '42px', height: '42px', borderRadius: '8px',
                              objectFit: 'cover', border: '1px solid var(--border)',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '42px', height: '42px', borderRadius: '8px',
                            backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Package size={20} color="var(--muted)" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                            {item.productName || 'Unnamed Product'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                            ID: {item._id.substring(item._id.length - 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {getStatusBadge(item.status)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                          {item.complianceScore ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        fontSize: '13px', fontWeight: 600,
                        color: item.violations?.length > 0 ? 'var(--danger)' : 'var(--teal)'
                      }}>
                        {item.violations?.length || 0} violation(s)
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--muted)' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate('/history')}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--navy)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--navy)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--navy)';
                        }}
                      >
                        View Audit <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;