import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const loadAccounts = useCallback(async () => {
    try {
      setError("");
      const result = await api("/admin/accounts");
      setAccounts(result.accounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  async function updateStatus(account, status) {
    setBusyId(account.id);
    setError("");

    try {
      await api(`/admin/accounts/${account.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadAccounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="card dashboard-card p-3 p-md-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="h4 dashboard-heading mb-1">Account management</h2>
          <p className="text-secondary mb-0">
            Approve manager requests and manage account access.
          </p>
        </div>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={loadAccounts}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="text-secondary">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p className="text-secondary">No accounts found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="fw-semibold">{account.name}</td>
                  <td>{account.email}</td>
                  <td>
                    <span className="badge text-bg-light border">
                      {account.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        account.status === "active"
                          ? "text-bg-success"
                          : account.status === "pending"
                            ? "text-bg-warning"
                            : "text-bg-danger"
                      }`}
                    >
                      {account.status}
                    </span>
                  </td>
                  <td>
                    {account.role === "admin" ? (
                      <span className="text-secondary small">Protected</span>
                    ) : (
                      <select
                        className="form-select form-select-sm"
                        value={account.status}
                        disabled={busyId === account.id}
                        aria-label={`Change status for ${account.name}`}
                        onChange={(event) =>
                          updateStatus(account, event.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active / Approve</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
