import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Users, ClipboardCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
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
          border: '3px solid var(--border)', borderTopColor: 'var(--amber)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ fontWeight: 500, fontSize: '15px' }}>Loading Admin Overview...</p>
      </div>
    );
  }
  if (error) return <p style={{ color: '#F87171' }}>{error}</p>;

  const cards = [
    { label: 'Total Inspections', value: stats.totalInspections, Icon: ClipboardCheck, color: 'var(--teal)' },
    { label: 'Total Officers', value: stats.totalOfficers, Icon: Users, color: 'var(--amber)' },
    { label: 'Passed', value: stats.passed, Icon: CheckCircle, color: '#22C55E' },
    { label: 'Failed', value: stats.failed, Icon: XCircle, color: '#EF4444' },
    { label: 'Under Review', value: stats.review, Icon: AlertTriangle, color: '#F59E0B' },
  ];

  return (
    <div>
      <h2 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>
        Admin Overview
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {cards.map(({ label, value, Icon, color }) => (
          <div
            key={label}
            style={{
              backgroundColor: 'var(--card-bg, #fff)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Icon size={22} color={color} strokeWidth={2} />
            <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text)' }}>{value}</span>
            <span style={{ fontSize: '13px', color: 'rgba(0,0,0,0.55)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: 'var(--card-bg, #fff)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '10px',
          padding: '18px',
        }}
      >
        <p style={{ color: 'var(--text)', fontSize: '14px' }}>
          Overall Compliance Rate:{' '}
          <strong style={{ color: 'var(--teal)' }}>{stats.compliancePercentage}%</strong>
        </p>
      </div>
    </div>
  );
}

export default AdminOverview;
