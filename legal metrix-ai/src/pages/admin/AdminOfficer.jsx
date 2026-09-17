import { useState, useEffect } from 'react';
import API from '../../api/axios';

function AdminOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOfficers();
  }, []);

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

  if (loading) return <p style={{ color: 'var(--text)' }}>Loading officers...</p>;
  if (error) return <p style={{ color: '#F87171' }}>{error}</p>;

  return (
    <div>
      <h2 style={{ color: 'var(--text)', fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>
        Officers ({officers.length})
      </h2>

      <div
        style={{
          backgroundColor: 'var(--card-bg, #fff)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', textAlign: 'left' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Total Scans</th>
              <th style={thStyle}>Pass Rate</th>
              <th style={thStyle}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {officers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
                  No officers found
                </td>
              </tr>
            ) : (
              officers.map((officer) => (
                <tr key={officer._id} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <td style={tdStyle}>{officer.name}</td>
                  <td style={tdStyle}>{officer.email}</td>
                  <td style={tdStyle}>{officer.totalScans}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: officer.passRate >= 70 ? '#22C55E' : officer.passRate >= 40 ? '#F59E0B' : '#EF4444',
                        fontWeight: 600,
                      }}
                    >
                      {officer.passRate}%
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(officer.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(0,0,0,0.55)',
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '12px 16px',
  fontSize: '14px',
  color: 'var(--text)',
};

export default AdminOfficers;