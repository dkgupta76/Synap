import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (mode === "login") {
        const result = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        onLogin(result.user);

        const requestedPath = location.state?.from?.pathname;
        const destination =
          requestedPath === result.redirectTo
            ? requestedPath
            : result.redirectTo;

        navigate(destination, { replace: true });
      } else {
        const result = await api("/auth/register", {
          method: "POST",
          body: JSON.stringify(form),
        });

        if (result.user) {
          onLogin(result.user);
          navigate(result.redirectTo, { replace: true });
        } else {
          setMessage(result.message);
          setMode("login");
          setForm({
            name: "",
            email: form.email,
            password: "",
            role: "user",
          });
        }
      }
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
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            <div className="card auth-card p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="synapse-logo mx-auto mb-3">
                  <i className="bi bi-diagram-3-fill" />
                </div>

                <h1 className="fw-bold brand-title">Synapse</h1>
                <p className="text-secondary mb-0">
                  Secure Role-Based Access Platform
                </p>
              </div>

              <h2 className="h4 fw-bold mb-1">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>

              <p className="text-secondary small mb-4">
                {mode === "login"
                  ? "Sign in to continue to your workspace."
                  : "Register for access to Synapse."}
              </p>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {message && (
                <div className="alert alert-info" role="status">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {mode === "register" && (
                  <>
                    <label className="form-label" htmlFor="name">
                      Full name
                    </label>
                    <input
                      id="name"
                      className="form-control mb-3"
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      required
                    />

                    <label className="form-label" htmlFor="role">
                      Account type
                    </label>
                    <select
                      id="role"
                      className="form-select mb-3"
                      name="role"
                      value={form.role}
                      onChange={updateForm}
                    >
                      <option value="user">User</option>
                      <option value="manager">
                        Manager — approval required
                      </option>
                    </select>
                  </>
                )}

                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  className="form-control mb-3"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateForm}
                  autoComplete="email"
                  maxLength={254}
                  required
                />

                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="form-control mb-2"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={updateForm}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={mode === "register" ? 10 : undefined}
                  maxLength={72}
                  required
                />

                {mode === "login" && (
                  <div className="text-end mb-4">
                    <Link to="/forgot-password" className="small">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {mode === "register" && <div className="mb-4" />}

                <button
                  className="btn btn-synapse w-100 py-2"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Please wait...
                    </>
                  ) : mode === "login" ? (
                    "Sign in"
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="text-center mt-4 small">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      className="btn btn-link p-0 align-baseline"
                      onClick={() => {
                        setMode("register");
                        setError("");
                        setMessage("");
                      }}
                    >
                      Create account
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <button
                      className="btn btn-link p-0 align-baseline"
                      onClick={() => {
                        setMode("login");
                        setError("");
                        setMessage("");
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <p className="text-center text-secondary small mt-4 mb-0">
                Protected access · Synapse
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
