import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";

const roleLabels = {
  admin: "Administrator",
  manager: "Manager",
  user: "User",
};

export default function DashboardLayout({
  user,
  onLogout,
  title,
  subtitle,
  children,
}) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error.message);
    } finally {
      onLogout();
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="synapse-app min-vh-100">
      <nav className="navbar bg-white border-bottom sticky-top">
        <div className="container-fluid px-3 px-lg-5">
          <NavLink
            to={`/${user.role}`}
            className="navbar-brand d-flex align-items-center gap-2 fw-bold"
          >
            <span className="brand-mark">
              <i className="bi bi-diagram-3-fill" />
            </span>
            <span>Synapse</span>
          </NavLink>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="fw-semibold small">{user.name}</div>
              <div className="text-secondary small">
                {roleLabels[user.role]}
              </div>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container-fluid px-3 px-lg-5 py-4 py-lg-5">
        <div className="mb-4">
          <p className="eyebrow mb-2">{roleLabels[user.role]} WORKSPACE</p>
          <h1 className="h2 dashboard-heading mb-2">{title}</h1>
          <p className="text-secondary mb-0">{subtitle}</p>
        </div>

        {children}

        <footer className="text-secondary small text-center mt-5">
          Synapse · Secure Role-Based Access Platform
        </footer>
      </main>
    </div>
  );
}
