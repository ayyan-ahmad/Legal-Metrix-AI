import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

function StatCard({ count, label, subtext, borderColor, bgColor, textColor, Icon, percentage }) {
  return (
    <div style={{
      flex: '1 1 210px',
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      borderTop: `4px solid ${borderColor}`,
      borderRadius: '16px',
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          backgroundColor: borderColor + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={textColor} strokeWidth={2.2} />
        </div>
        {percentage !== undefined && (
          <span style={{
            fontSize: '12px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '99px', backgroundColor: borderColor + '18', color: textColor,
          }}>
            {percentage}%
          </span>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '32px', fontWeight: 800, color: textColor, margin: 0, lineHeight: 1.1 }}>
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

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await API.get('/analytics/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics stats:', error);
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

  const statusData = [
    { name: 'Compliant (Pass)', value: passed },
    { name: 'Non-Compliant (Fail)', value: failed },
    { name: 'Needs Review', value: review },
  ];
  const STATUS_COLORS = ['#0F6E56', '#A32D2D', '#B5720F'];

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
        <p style={{ fontWeight: 500, fontSize: '15px' }}>Loading Legal Metrix Visual Analytics…</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* ── 1. Page Header Banner ────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1c2e58 60%, #0F6E56 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#FFFFFF',
        marginBottom: '28px',
        boxShadow: '0 8px 24px rgba(22,36,71,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 12px',
            borderRadius: '999px', fontSize: '12px', fontWeight: 600, marginBottom: '10px'
          }}>
            <BarChart3 size={14} color="var(--teal-light)" />
            Real-time Metrology Data Visualizer
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Compliance Analytics & Visual Insights
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Visual distribution of audit outcomes and rule violation frequency analysis.
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', textAlign: 'right'
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', fontWeight: 700 }}>Overall Compliance</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--teal-light)' }}>{complianceRate}%</div>
        </div>
      </div>

      {/* ── 2. Stat Summary Cards ───────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <StatCard
          count={total}
          label="Total Audited Products"
          subtext="Cumulative count"
          borderColor="var(--navy)"
          bgColor="var(--surface)"
          textColor="var(--navy)"
          Icon={ClipboardList}
        />
        <StatCard
          count={passed}
          label="Compliant Scans"
          subtext="Passed all rules"
          borderColor="var(--teal)"
          bgColor="var(--teal-light)"
          textColor="var(--teal)"
          Icon={CheckCircle2}
          percentage={total > 0 ? Math.round((passed / total) * 100) : 0}
        />
        <StatCard
          count={failed}
          label="Violation Scans"
          subtext="Failed mandatory rules"
          borderColor="var(--danger)"
          bgColor="var(--danger-light)"
          textColor="var(--danger)"
          Icon={XCircle}
          percentage={total > 0 ? Math.round((failed / total) * 100) : 0}
        />
        <StatCard
          count={review}
          label="Pending Review"
          subtext="Requires officer sign-off"
          borderColor="var(--amber)"
          bgColor="var(--amber-light)"
          textColor="var(--amber)"
          Icon={AlertTriangle}
          percentage={total > 0 ? Math.round((review / total) * 100) : 0}
        />
      </div>

      {/* ── 3. Visual Charts Grid (Recharts) ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Compliance Distribution PieChart */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieIcon size={18} color="var(--teal)" strokeWidth={2.2} />
              Compliance Status Distribution
            </h4>
            <span style={{
              fontSize: '13px', fontWeight: 800, color: rateColor,
              backgroundColor: rateBg, padding: '3px 10px', borderRadius: '99px',
            }}>
              {complianceRate}% Pass Rate
            </span>
          </div>

          {total === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No inspection data available for distribution chart.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Violations by Category BarChart */}
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--navy)" strokeWidth={2.2} />
            Violations Frequency by Rule Category
          </h4>

          {!stats?.violationBreakdown || stats.violationBreakdown.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No violations recorded. All inspections passed! 🎉
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={stats.violationBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="field"
                  stroke="var(--muted)"
                  fontSize={11}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  tick={{ fill: 'var(--ink)', fontWeight: 600 }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="var(--muted)"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="count" fill="#2A5298" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 4. Legal Metrology Pillars Scorecard ────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--teal)" />
          Legal Metrology 5-Pillar Rule Scorecard
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { code: 'MRP-001', label: 'Maximum Retail Price', field: 'mrp', severity: 'High' },
            { code: 'NET-001', label: 'Net Quantity', field: 'netQuantity', severity: 'High' },
            { code: 'MFR-001', label: 'Manufacturer Details', field: 'manufacturer', severity: 'High' },
            { code: 'CC-001', label: 'Consumer Care Contact', field: 'consumerCare', severity: 'Medium' },
            { code: 'DATE-001', label: 'Mfg / Packing Date', field: 'manufacturingDate', severity: 'Medium' },
          ].map((r) => {
            const fieldViolations = stats?.violationBreakdown?.find((v) => v.field === r.field)?.count || 0;
            return (
              <div key={r.code} style={{
                backgroundColor: 'var(--bg)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--navy)' }}>{r.code}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                    backgroundColor: fieldViolations > 0 ? 'var(--danger-light)' : 'var(--teal-light)',
                    color: fieldViolations > 0 ? 'var(--danger)' : 'var(--teal)',
                  }}>
                    {fieldViolations > 0 ? `${fieldViolations} Violations` : 'Clean'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{r.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
