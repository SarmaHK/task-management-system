import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // Show a sleek loading state while checking session
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#E6F5F6] font-sans">
        <div className="w-10 h-10 border-4 border-[#118B95]/35 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <span className="text-[14px] text-indigo-900 font-semibold tracking-wide">
          Verifying session...
        </span>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password reset if it's the user's first login
  if (user.mustChangePassword) {
    return <Navigate to="/setup-password" replace />;
  }

  // Check role authorization (case-insensitive)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toUpperCase();
    const hasRole = allowedRoles.some(role => role.toUpperCase() === userRole);

    if (!hasRole) {
      // If unauthorized, redirect to standard landing page (dashboard)
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render child routes
  return <Outlet />;
}
