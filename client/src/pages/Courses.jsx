import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Courses() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", dept: "", credits: 4, facultyId: "", semester: "Odd 2026" });
  const [error, setError] = useState("");

  function load() {
    Promise.all([api("/api/courses"), api("/api/faculty")])
      .then(([courses, staff]) => {
        setRows(courses);
        setFaculty(staff);
        if (staff[0]) setForm((f) => ({ ...f, facultyId: f.facultyId || staff[0].id }));
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/courses", { method: "POST", body: form });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Courses</h1>
          <p className="muted">Semester offerings and assigned instructors.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {user.role === "admin" && (
        <form className="panel" onSubmit={add}>
          <h2>Add course</h2>
          <div className="form-row">
            <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Department" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} />
            <input type="number" placeholder="Credits" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
            <select value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <input placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
          </div>
          <button className="btn">Save</button>
        </form>
      )}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Faculty</th>
              <th>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>{c.credits}</td>
                <td>{c.facultyName}</td>
                <td>{c.enrolled}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
