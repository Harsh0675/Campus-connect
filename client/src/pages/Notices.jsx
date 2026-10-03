import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Notices() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });
  const [error, setError] = useState("");
  const canPost = user.role === "admin" || user.role === "faculty";

  function load() {
    api("/api/notices")
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/notices", { method: "POST", body: form });
      setForm({ title: "", body: "", audience: "all" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Notices</h1>
          <p className="muted">Campus-wide and role-specific announcements.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {canPost && (
        <form className="panel" onSubmit={add}>
          <h2>Publish notice</h2>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Details" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            <option value="all">Everyone</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
          </select>
          <button className="btn">Post</button>
        </form>
      )}
      <div className="panel">
        {rows.map((n) => (
          <article className="notice" key={n.id}>
            <h3>{n.title}</h3>
            <p className="muted">
              {n.date} · {n.author} · {n.audience}
            </p>
            <p>{n.body}</p>
          </article>
        ))}
      </div>
    </>
  );
}
