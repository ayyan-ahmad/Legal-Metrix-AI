import { useEffect, useState } from 'react';
import API from '../api/axios';

function Dashboard() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect - page load hote hi ek baar data fetch karne ke liye
  useEffect(() => {
    fetchInspections();
  }, []); // khali array [] ka matlab: sirf ek baar chalega, jab component mount ho

  const fetchInspections = async () => {
    try {
      const response = await API.get('/inspections');
      setInspections(response.data);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = inspections.length;
  const passed = inspections.filter((i) => i.status === 'pass').length;
  const failed = inspections.filter((i) => i.status === 'fail').length;
  const review = inspections.filter((i) => i.status === 'review').length;

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>{total}</h3>
          <p>Total Inspections</p>
        </div>
        <div style={{ border: '1px solid green', padding: '15px', borderRadius: '8px' }}>
          <h3>{passed}</h3>
          <p>Compliant</p>
        </div>
        <div style={{ border: '1px solid red', padding: '15px', borderRadius: '8px' }}>
          <h3>{failed}</h3>
          <p>Non-Compliant</p>
        </div>
        <div style={{ border: '1px solid orange', padding: '15px', borderRadius: '8px' }}>
          <h3>{review}</h3>
          <p>Needs Review</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;