import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { api } from "./api";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import UserDashboard from "./pages/UserDashboard";

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api("/auth/me")
      .then((result) => {
        if (active) setUser(result.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function handleLogin(nextUser) {
    setUser(nextUser);
  }

  function handleLogout() {
    setUser(null);
  }

  function HomeRedirect() {
    if (loading) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" />
        </div>
      );
    }

    return <Navigate to={user ? `/${user.role}` : "/login"} replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/login"
        element={
          loading ? (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
              <div className="spinner-border text-primary" />
            </div>
          ) : user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <AuthPage onLogin={handleLogin} />
          )
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        element={
          <ProtectedRoute
            user={user}
            loading={loading}
            allowedRoles={["admin"]}
          />
        }
      >
        <Route
          path="/admin"
          element={<AdminDashboard user={user} onLogout={handleLogout} />}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            user={user}
            loading={loading}
            allowedRoles={["manager"]}
          />
        }
      >
        <Route
          path="/manager"
          element={<ManagerDashboard user={user} onLogout={handleLogout} />}
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            user={user}
            loading={loading}
            allowedRoles={["user"]}
          />
        }
      >
        <Route
          path="/user"
          element={<UserDashboard user={user} onLogout={handleLogout} />}
        />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
