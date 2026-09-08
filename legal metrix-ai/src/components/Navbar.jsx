import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Context ka function - localStorage clear karega, state reset karega
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '15px', borderBottom: '1px solid #ccc' }}>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/scan">Scan Product</Link>
      <Link to="/history">History</Link>

      {/* Ye sirf Admin ko dikhega - role check yahin ho raha hai */}
      {user?.role === 'admin' && <Link to="/rules">Manage Rules</Link>}

      <span style={{ marginLeft: 'auto' }}>
        {user?.name} ({user?.role})
      </span>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;