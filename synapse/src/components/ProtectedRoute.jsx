import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ user, loading, allowedRoles }) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-secondary">Loading Synapse...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}
