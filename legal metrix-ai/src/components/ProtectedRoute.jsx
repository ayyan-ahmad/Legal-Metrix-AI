import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * requiredRole = 'admin'  → sirf admin access kar sakta hai, officer /dashboard par jayega
 * requiredRole = 'officer' → sirf officer access kar sakta hai, admin /admin par jayega
 * requiredRole = undefined → koi bhi logged-in user access kar sakta hai,
 *                             lekin admin ko admin pages par redirect kar do
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  // Not logged in → login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route: officer/others → back to their dashboard
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Officer-only route OR generic protected route: admin must NOT access officer pages
  if (user.role === 'admin' && requiredRole !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;