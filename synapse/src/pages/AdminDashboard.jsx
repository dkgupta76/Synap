import { useEffect, useState } from "react";
import { api } from "../api";
import DashboardLayout from "./DashboardLayout";
import AdminAccounts from "./AdminAccounts";

export default function AdminDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const stats = data?.stats;

  const cards = [
    {
      label: "Total accounts",
      value: stats?.total ?? "—",
      icon: "bi-people",
      color: "purple",
    },
    {
      label: "Users",
      value: stats?.users ?? "—",
      icon: "bi-person",
      color: "blue",
    },
    {
      label: "Managers",
      value: stats?.managers ?? "—",
      icon: "bi-briefcase",
      color: "teal",
    },
    {
      label: "Pending approvals",
      value: stats?.pendingManagers ?? "—",
      icon: "bi-hourglass-split",
      color: "orange",
    },
  ];

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      title="Admin Dashboard"
      subtitle="Manage Synapse accounts, access, and manager approvals."
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {data && (
        <div className="alert alert-light border mb-4">
          <i className="bi bi-shield-check me-2 text-primary" />
          {data.message}
        </div>
      )}

      <div className="row g-3 mb-4">
        {cards.map((card) => (
          <div className="col-12 col-sm-6 col-xl-3" key={card.label}>
            <div className="card dashboard-card stat-card h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-secondary small mb-2">{card.label}</p>
                    <div className="display-6 fw-bold">{card.value}</div>
                  </div>

                  <div className={`stat-icon ${card.color}`}>
                    <i className={`bi ${card.icon}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminAccounts />
    </DashboardLayout>
  );
}
