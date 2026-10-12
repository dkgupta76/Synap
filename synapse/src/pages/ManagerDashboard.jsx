import { useEffect, useState } from "react";
import { api } from "../api";
import DashboardLayout from "./DashboardLayout";

export default function ManagerDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/manager")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const features = [
    {
      icon: "bi-graph-up-arrow",
      title: "Management overview",
      description: "A workspace for reviewing operational information.",
    },
    {
      icon: "bi-people",
      title: "Team activity",
      description: "A starting point for future team-management features.",
    },
    {
      icon: "bi-clipboard-check",
      title: "Manager tools",
      description: "A dedicated space for your management workflows.",
    },
  ];

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      title="Manager Dashboard"
      subtitle="Your Synapse management workspace."
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {data && (
        <div className="alert alert-success bg-white border">
          <i className="bi bi-check-circle me-2" />
          {data.message}
        </div>
      )}

      <div className="row g-3 mb-4">
        {features.map((feature) => (
          <div className="col-12 col-md-6 col-xl-4" key={feature.title}>
            <div className="card dashboard-card feature-card h-100">
              <div className="card-body p-4">
                <div className="feature-icon manager-icon mb-3">
                  <i className={`bi ${feature.icon}`} />
                </div>
                <h2 className="h5 fw-bold">{feature.title}</h2>
                <p className="text-secondary mb-0">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card dashboard-card p-4">
        <h2 className="h5 fw-bold">Your account</h2>
        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <div className="text-secondary small">Name</div>
            <div className="fw-semibold">{user.name}</div>
          </div>
          <div className="col-md-6">
            <div className="text-secondary small">Email</div>
            <div className="fw-semibold">{user.email}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
