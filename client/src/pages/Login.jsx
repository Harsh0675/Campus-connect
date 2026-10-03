import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-art">
        <div>
          <div className="role-chip">Minor project · College ERP</div>
          <h1>CampusConnect</h1>
          <p>
            One portal for students, faculty, and administration — courses, attendance, marks, and
            campus notices in a single place.
          </p>
        </div>
        <p>Designed for a college management minor project demo.</p>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <h2>Sign in</h2>
          <p className="hint">Use a demo account to explore each role.</p>
          {error && <p className="error">{error}</p>}
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn" disabled={busy}>
            {busy ? "Signing in…" : "Enter campus"}
          </button>
          <div className="demo-box">
            <div>
              <b>admin</b> / admin123 — dean
            </div>
            <div>
              <b>faculty</b> / faculty123 — Prof. Vikram Shah
            </div>
            <div>
              <b>student</b> / student123 — Meera Iyer
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
