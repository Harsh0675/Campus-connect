import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading dashboard…</p>;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Good to see you, {user.name.replace(/^Dr\. |^Prof\. /, "").split(" ")[0]}</h1>
          <p className="muted">
            {user.role === "admin"
              ? "Campus overview for the current semester."
              : user.role === "faculty"
                ? "Your teaching load and recent campus notices."
                : "Your courses, attendance, and announcements."}
          </p>
        </div>
      </div>
      <div className="grid">
        {data.stats.map((s) => (
          <div className="stat" key={s.label}>
            <span>{s.label}</span>
            <b>{s.value}</b>
          </div>
        ))}
      </div>
      <div className="two-col">
        <div className="panel">
          <h2>Notices</h2>
          {data.notices.map((n) => (
            <article className="notice" key={n.id}>
              <h3>{n.title}</h3>
              <p className="muted">
                {n.date} · {n.author}
              </p>
              <p>{n.body}</p>
            </article>
          ))}
        </div>
        <div className="panel">
          <h2>Courses</h2>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {data.courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
