import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const empty = { rollNo: "", name: "", dept: "Computer Science", year: 1, email: "", phone: "", gpa: "" };

export default function Students() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function load() {
    api("/api/students")
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/students", { method: "POST", body: form });
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
          <h1>Students</h1>
          <p className="muted">Academic records for enrolled students.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {user.role === "admin" && (
        <form className="panel" onSubmit={add}>
          <h2>Add student</h2>
          <div className="form-row">
            <input placeholder="Roll no" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Department" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
            <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="GPA" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
          </div>
          <button className="btn">Save</button>
        </form>
      )}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Year</th>
              <th>GPA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.rollNo}</td>
                <td>{s.name}</td>
                <td>{s.dept}</td>
                <td>{s.year}</td>
                <td>{s.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
