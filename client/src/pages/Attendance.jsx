import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Attendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [enrolled, setEnrolled] = useState([]);
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState({});
  const [error, setError] = useState("");
  const [summary, setSummary] = useState([]);

  const canMark = user.role === "admin" || user.role === "faculty";

  useEffect(() => {
    api("/api/courses")
      .then((rows) => {
        setCourses(rows);
        if (rows[0]) setCourseId(rows[0].id);
      })
      .catch((e) => setError(e.message));
    if (user.role === "student") {
      api(`/api/summary/attendance/${user.studentId}`).then(setSummary).catch(() => {});
      api("/api/attendance").then(setLogs).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!courseId || user.role === "student") return;
    Promise.all([
      api(`/api/enrollments?courseId=${courseId}`),
      api(`/api/attendance?courseId=${courseId}`),
    ]).then(([people, attendance]) => {
      setEnrolled(people);
      setLogs(attendance);
      const next = {};
      people.forEach((p) => {
        next[p.studentId] = "P";
      });
      setMarks(next);
    });
  }, [courseId, user.role]);

  const selected = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/attendance", { method: "POST", body: { courseId, date, records: marks } });
      const attendance = await api(`/api/attendance?courseId=${courseId}`);
      setLogs(attendance);
    } catch (err) {
      setError(err.message);
    }
  }

  if (user.role === "student") {
    return (
      <>
        <div className="topbar">
          <div>
            <h1>Attendance</h1>
            <p className="muted">Your presence across enrolled courses.</p>
          </div>
        </div>
        <div className="grid">
          {summary.map((s) => (
            <div className="stat" key={s.courseId}>
              <span>
                {s.code} · {s.courseName}
              </span>
              <b>{s.percent ?? "—"}%</b>
            </div>
          ))}
        </div>
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>{l.courseName}</td>
                  <td className={l.status === "P" ? "present" : "absent"}>{l.status === "P" ? "Present" : "Absent"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Attendance</h1>
          <p className="muted">{selected ? selected.name : "Select a course"}</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        <label>Course</label>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>
      {canMark && (
        <form className="panel" onSubmit={save}>
          <h2>Mark today’s class</h2>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>
              {enrolled.map((e) => (
                <tr key={e.studentId}>
                  <td>
                    {e.student?.name} <span className="muted">({e.student?.rollNo})</span>
                  </td>
                  <td>
                    <select
                      value={marks[e.studentId] || "P"}
                      onChange={(ev) => setMarks({ ...marks, [e.studentId]: ev.target.value })}
                    >
                      <option value="P">Present</option>
                      <option value="A">Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn">Save attendance</button>
        </form>
      )}
      <div className="panel">
        <h2>Past sessions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Present</th>
              <th>Absent</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => {
              const values = Object.values(l.records || {});
              return (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td className="present">{values.filter((v) => v === "P").length}</td>
                  <td className="absent">{values.filter((v) => v === "A").length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
