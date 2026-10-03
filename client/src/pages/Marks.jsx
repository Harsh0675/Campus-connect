import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Marks() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [enrolled, setEnrolled] = useState([]);
  const [rows, setRows] = useState([]);
  const [exam, setExam] = useState("Midterm");
  const [max, setMax] = useState(50);
  const [scores, setScores] = useState({});
  const [error, setError] = useState("");
  const canEnter = user.role === "admin" || user.role === "faculty";

  useEffect(() => {
    api("/api/courses")
      .then((list) => {
        setCourses(list);
        if (list[0]) setCourseId(list[0].id);
      })
      .catch((e) => setError(e.message));
    if (user.role === "student") {
      api("/api/marks").then(setRows).catch((e) => setError(e.message));
    }
  }, [user]);

  useEffect(() => {
    if (!courseId || user.role === "student") return;
    Promise.all([api(`/api/enrollments?courseId=${courseId}`), api("/api/marks")]).then(
      ([people, marks]) => {
        setEnrolled(people);
        setRows(marks.filter((m) => m.courseId === courseId));
        const next = {};
        people.forEach((p) => {
          next[p.studentId] = 0;
        });
        setScores(next);
      }
    );
  }, [courseId, user.role]);

  async function save(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/marks", { method: "POST", body: { courseId, exam, max, scores } });
      const marks = await api("/api/marks");
      setRows(marks.filter((m) => m.courseId === courseId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (user.role === "student") {
    return (
      <>
        <div className="topbar">
          <div>
            <h1>Marks</h1>
            <p className="muted">Assessment scores from your instructors.</p>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Exam</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.courseName}</td>
                  <td>{r.exam}</td>
                  <td>
                    {r.score} / {r.max}
                  </td>
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
          <h1>Marks</h1>
          <p className="muted">Enter and review assessments.</p>
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
      {canEnter && (
        <form className="panel" onSubmit={save}>
          <h2>New assessment</h2>
          <div className="form-row">
            <input value={exam} onChange={(e) => setExam(e.target.value)} placeholder="Exam name" />
            <input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max marks" />
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {enrolled.map((e) => (
                <tr key={e.studentId}>
                  <td>{e.student?.name}</td>
                  <td>
                    <input
                      type="number"
                      value={scores[e.studentId] ?? 0}
                      onChange={(ev) => setScores({ ...scores, [e.studentId]: Number(ev.target.value) })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn">Save marks</button>
        </form>
      )}
      <div className="panel">
        <h2>Recorded assessments</h2>
        {rows.map((r) => (
          <article className="notice" key={r.id}>
            <h3>
              {r.exam} <span className="badge">/{r.max}</span>
            </h3>
            <p className="muted">{Object.keys(r.scores || {}).length} scores submitted</p>
          </article>
        ))}
      </div>
    </>
  );
}
