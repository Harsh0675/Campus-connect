import express from "express";
import cors from "cors";
import crypto from "crypto";
import { loadDb, saveDb, hashPassword, id } from "./store.js";

const app = express();
const PORT = process.env.PORT || 5000;
const sessions = new Map();

app.use(cors());
app.use(express.json());

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const session = token && sessions.get(token);
  if (!session) return res.status(401).json({ error: "Please sign in." });
  req.user = session;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have access to this action." });
    }
    next();
  };
}

function attendancePercent(db, studentId, courseId) {
  const sessionsForCourse = db.attendance.filter((a) => a.courseId === courseId);
  const relevant = sessionsForCourse.filter((a) => a.records[studentId] !== undefined);
  if (!relevant.length) return null;
  const present = relevant.filter((a) => a.records[studentId] === "P").length;
  return Math.round((present / relevant.length) * 100);
}

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const db = loadDb();
  const user = db.users.find(
    (u) => u.username === String(username || "").trim() && u.password === hashPassword(password || "")
  );
  if (!user) return res.status(401).json({ error: "Invalid username or password." });
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, publicUser(user));
  res.json({ token, user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/logout", auth, (req, res) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  sessions.delete(token);
  res.json({ ok: true });
});

app.get("/api/dashboard", auth, (req, res) => {
  const db = loadDb();
  const role = req.user.role;
  const notices = db.notices
    .filter((n) => n.audience === "all" || n.audience === role)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (role === "admin") {
    return res.json({
      stats: [
        { label: "Students", value: db.students.length },
        { label: "Faculty", value: db.faculty.length },
        { label: "Courses", value: db.courses.length },
        { label: "Notices", value: db.notices.length },
      ],
      notices,
      courses: db.courses,
    });
  }

  if (role === "faculty") {
    const facultyId = req.user.facultyId;
    const courses = db.courses.filter((c) => c.facultyId === facultyId);
    const enrolled = db.enrollments.filter((e) => courses.some((c) => c.id === e.courseId));
    return res.json({
      stats: [
        { label: "My courses", value: courses.length },
        { label: "Enrolled students", value: new Set(enrolled.map((e) => e.studentId)).size },
        { label: "Attendance logs", value: db.attendance.filter((a) => courses.some((c) => c.id === a.courseId)).length },
        { label: "Assessments", value: db.marks.filter((m) => courses.some((c) => c.id === m.courseId)).length },
      ],
      notices,
      courses,
    });
  }

  const studentId = req.user.studentId;
  const courseIds = db.enrollments.filter((e) => e.studentId === studentId).map((e) => e.courseId);
  const courses = db.courses.filter((c) => courseIds.includes(c.id));
  const percents = courses
    .map((c) => attendancePercent(db, studentId, c.id))
    .filter((p) => p !== null);
  const avgAtt = percents.length ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0;
  return res.json({
    stats: [
      { label: "Enrolled courses", value: courses.length },
      { label: "Avg attendance", value: `${avgAtt}%` },
      { label: "GPA", value: db.students.find((s) => s.id === studentId)?.gpa ?? "—" },
      { label: "Notices", value: notices.length },
    ],
    notices,
    courses,
  });
});

app.get("/api/students", auth, (req, res) => {
  const db = loadDb();
  if (req.user.role === "student") {
    return res.json(db.students.filter((s) => s.id === req.user.studentId));
  }
  res.json(db.students);
});

app.post("/api/students", auth, requireRole("admin"), (req, res) => {
  const db = loadDb();
  const { rollNo, name, dept, year, email, phone, gpa } = req.body;
  if (!rollNo || !name) return res.status(400).json({ error: "Roll number and name are required." });
  const student = {
    id: id("s"),
    rollNo,
    name,
    dept: dept || "",
    year: Number(year) || 1,
    email: email || "",
    phone: phone || "",
    gpa: Number(gpa) || 0,
  };
  db.students.push(student);
  saveDb(db);
  res.status(201).json(student);
});

app.get("/api/faculty", auth, (req, res) => {
  res.json(loadDb().faculty);
});

app.post("/api/faculty", auth, requireRole("admin"), (req, res) => {
  const db = loadDb();
  const { name, dept, email, phone, designation } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required." });
  const member = {
    id: id("f"),
    name,
    dept: dept || "",
    email: email || "",
    phone: phone || "",
    designation: designation || "Faculty",
  };
  db.faculty.push(member);
  saveDb(db);
  res.status(201).json(member);
});

app.get("/api/courses", auth, (req, res) => {
  const db = loadDb();
  let courses = db.courses;
  if (req.user.role === "faculty") {
    courses = courses.filter((c) => c.facultyId === req.user.facultyId);
  }
  if (req.user.role === "student") {
    const ids = db.enrollments.filter((e) => e.studentId === req.user.studentId).map((e) => e.courseId);
    courses = courses.filter((c) => ids.includes(c.id));
  }
  const withMeta = courses.map((c) => ({
    ...c,
    facultyName: db.faculty.find((f) => f.id === c.facultyId)?.name || "Unassigned",
    enrolled: db.enrollments.filter((e) => e.courseId === c.id).length,
  }));
  res.json(withMeta);
});

app.post("/api/courses", auth, requireRole("admin"), (req, res) => {
  const db = loadDb();
  const { code, name, dept, credits, facultyId, semester } = req.body;
  if (!code || !name) return res.status(400).json({ error: "Code and name are required." });
  const course = {
    id: id("c"),
    code,
    name,
    dept: dept || "",
    credits: Number(credits) || 3,
    facultyId: facultyId || "",
    semester: semester || "Odd 2026",
  };
  db.courses.push(course);
  saveDb(db);
  res.status(201).json(course);
});

app.get("/api/enrollments", auth, (req, res) => {
  const db = loadDb();
  const { courseId } = req.query;
  let rows = db.enrollments;
  if (courseId) rows = rows.filter((e) => e.courseId === courseId);
  const detailed = rows.map((e) => ({
    ...e,
    student: db.students.find((s) => s.id === e.studentId),
    course: db.courses.find((c) => c.id === e.courseId),
  }));
  res.json(detailed);
});

app.get("/api/attendance", auth, (req, res) => {
  const db = loadDb();
  const { courseId } = req.query;
  let rows = db.attendance;
  if (courseId) rows = rows.filter((a) => a.courseId === courseId);
  if (req.user.role === "faculty") {
    const mine = db.courses.filter((c) => c.facultyId === req.user.facultyId).map((c) => c.id);
    rows = rows.filter((a) => mine.includes(a.courseId));
  }
  if (req.user.role === "student") {
    rows = rows
      .filter((a) => a.records[req.user.studentId] !== undefined)
      .map((a) => ({
        id: a.id,
        courseId: a.courseId,
        date: a.date,
        status: a.records[req.user.studentId],
        courseName: db.courses.find((c) => c.id === a.courseId)?.name,
      }));
    return res.json(rows);
  }
  res.json(
    rows.map((a) => ({
      ...a,
      courseName: db.courses.find((c) => c.id === a.courseId)?.name,
    }))
  );
});

app.post("/api/attendance", auth, requireRole("admin", "faculty"), (req, res) => {
  const db = loadDb();
  const { courseId, date, records } = req.body;
  if (!courseId || !date || !records) {
    return res.status(400).json({ error: "Course, date, and records are required." });
  }
  if (req.user.role === "faculty") {
    const course = db.courses.find((c) => c.id === courseId);
    if (!course || course.facultyId !== req.user.facultyId) {
      return res.status(403).json({ error: "You can only mark attendance for your courses." });
    }
  }
  const entry = { id: id("a"), courseId, date, records };
  db.attendance.push(entry);
  saveDb(db);
  res.status(201).json(entry);
});

app.get("/api/marks", auth, (req, res) => {
  const db = loadDb();
  let rows = db.marks;
  if (req.user.role === "faculty") {
    const mine = db.courses.filter((c) => c.facultyId === req.user.facultyId).map((c) => c.id);
    rows = rows.filter((m) => mine.includes(m.courseId));
  }
  if (req.user.role === "student") {
    rows = rows
      .filter((m) => m.scores[req.user.studentId] !== undefined)
      .map((m) => ({
        id: m.id,
        courseId: m.courseId,
        exam: m.exam,
        max: m.max,
        score: m.scores[req.user.studentId],
        courseName: db.courses.find((c) => c.id === m.courseId)?.name,
      }));
    return res.json(rows);
  }
  res.json(
    rows.map((m) => ({
      ...m,
      courseName: db.courses.find((c) => c.id === m.courseId)?.name,
    }))
  );
});

app.post("/api/marks", auth, requireRole("admin", "faculty"), (req, res) => {
  const db = loadDb();
  const { courseId, exam, max, scores } = req.body;
  if (!courseId || !exam) return res.status(400).json({ error: "Course and exam name are required." });
  if (req.user.role === "faculty") {
    const course = db.courses.find((c) => c.id === courseId);
    if (!course || course.facultyId !== req.user.facultyId) {
      return res.status(403).json({ error: "You can only enter marks for your courses." });
    }
  }
  const entry = { id: id("m"), courseId, exam, max: Number(max) || 100, scores: scores || {} };
  db.marks.push(entry);
  saveDb(db);
  res.status(201).json(entry);
});

app.get("/api/notices", auth, (req, res) => {
  const db = loadDb();
  const notices = db.notices
    .filter((n) => n.audience === "all" || n.audience === req.user.role || req.user.role === "admin")
    .sort((a, b) => b.date.localeCompare(a.date));
  res.json(notices);
});

app.post("/api/notices", auth, requireRole("admin", "faculty"), (req, res) => {
  const db = loadDb();
  const { title, body, audience } = req.body;
  if (!title || !body) return res.status(400).json({ error: "Title and body are required." });
  const notice = {
    id: id("n"),
    title,
    body,
    audience: audience || "all",
    date: new Date().toISOString().slice(0, 10),
    author: req.user.name,
  };
  db.notices.unshift(notice);
  saveDb(db);
  res.status(201).json(notice);
});

app.get("/api/summary/attendance/:studentId", auth, (req, res) => {
  const db = loadDb();
  const studentId = req.params.studentId;
  if (req.user.role === "student" && req.user.studentId !== studentId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const courseIds = db.enrollments.filter((e) => e.studentId === studentId).map((e) => e.courseId);
  const summary = courseIds.map((courseId) => {
    const course = db.courses.find((c) => c.id === courseId);
    return {
      courseId,
      courseName: course?.name,
      code: course?.code,
      percent: attendancePercent(db, studentId, courseId),
    };
  });
  res.json(summary);
});

app.listen(PORT, () => {
  loadDb();
  console.log(`CampusConnect API running on http://localhost:${PORT}`);
});
