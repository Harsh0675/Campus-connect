import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const empty = { name: "", dept: "", email: "", phone: "", designation: "Assistant Professor" };

export default function Faculty() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function load() {
    api("/api/faculty")
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/faculty", { method: "POST", body: form });
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Faculty</h1>
          <p className="muted">Teaching staff across departments.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {user.role === "admin" && (
        <form className="panel" onSubmit={add}>
          <h2>Add faculty</h2>
          <div className="form-row">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Department" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
            <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button className="btn">Save</button>
        </form>
      )}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Dept</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.designation}</td>
                <td>{f.dept}</td>
                <td>{f.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
