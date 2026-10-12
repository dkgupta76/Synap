import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const result = await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-background min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-9 col-md-6 col-lg-4">
            <div className="card auth-card p-4 p-md-5">
              <div className="synapse-logo mx-auto mb-3">
                <i className="bi bi-shield-lock-fill" />
              </div>

              <h1 className="h3 text-center fw-bold">Forgot password?</h1>
              <p className="text-secondary text-center mb-4">
                Enter your email to begin account recovery.
              </p>

              {error && <div className="alert alert-danger">{error}</div>}
              {message && <div className="alert alert-info">{message}</div>}

              <form onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="recovery-email">
                  Email address
                </label>
                <input
                  id="recovery-email"
                  className="form-control mb-4"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />

                <button className="btn btn-synapse w-100" disabled={busy}>
                  {busy ? "Please wait..." : "Continue"}
                </button>
              </form>

              <div className="text-center mt-4">
                <Link to="/login">
                  <i className="bi bi-arrow-left me-2" />
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
