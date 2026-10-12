import { useEffect, useState } from "react";
import { api } from "../api";
import DashboardLayout from "./DashboardLayout";

export default function UserDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/user")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      title="My Dashboard"
      subtitle="Welcome to your personal Synapse workspace."
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {data && (
        <div className="welcome-panel p-4 p-lg-5 mb-4">
          <span className="badge text-bg-light mb-3">
            <i className="bi bi-stars me-1" />
            Personal workspace
          </span>
          <h2 className="h3 fw-bold">{data.message}</h2>
          <p className="mb-0">
            Your account is active. Use this space for your personal workspace
            and account information.
          </p>
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card dashboard-card p-4 h-100">
            <h2 className="h5 fw-bold mb-3">Account information</h2>

            <div className="profile-row">
              <span className="text-secondary">Full name</span>
              <span className="fw-semibold">{user.name}</span>
            </div>

            <div className="profile-row">
              <span className="text-secondary">Email address</span>
              <span className="fw-semibold">{user.email}</span>
            </div>

            <div className="profile-row">
              <span className="text-secondary">Role</span>
              <span className="badge text-bg-primary">{user.role}</span>
            </div>

            <div className="profile-row">
              <span className="text-secondary">Account status</span>
              <span className="badge text-bg-success">Active</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card dashboard-card p-4 h-100">
            <div className="feature-icon user-icon mb-3">
              <i className="bi bi-shield-check" />
            </div>
            <h2 className="h5 fw-bold">Your access</h2>
            <p className="text-secondary">
              Synapse verifies your account and role before providing access to
              protected features.
            </p>
            <div className="mt-auto small text-success">
              <i className="bi bi-check-circle-fill me-2" />
              Authenticated session
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
