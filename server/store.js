import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
}

export function seedDatabase() {
  return {
    users: [
      {
        id: "u_admin",
        name: "Dr. Ananya Rao",
        email: "admin@campus.edu",
        username: "admin",
        password: hashPassword("admin123"),
        role: "admin",
        title: "Dean of Academics",
      },
      {
        id: "u_faculty",
        name: "Prof. Vikram Shah",
        email: "vikram.shah@campus.edu",
        username: "faculty",
        password: hashPassword("faculty123"),
        role: "faculty",
        facultyId: "f_vs",
      },
      {
        id: "u_student",
        name: "Meera Iyer",
        email: "meera.iyer@campus.edu",
        username: "student",
        password: hashPassword("student123"),
        role: "student",
        studentId: "s_mi",
      },
    ],
    faculty: [
      { id: "f_vs", name: "Prof. Vikram Shah", dept: "Computer Science", email: "vikram.shah@campus.edu", phone: "9876500011", designation: "Associate Professor" },
      { id: "f_nk", name: "Dr. Nisha Kapoor", dept: "Electronics", email: "nisha.kapoor@campus.edu", phone: "9876500012", designation: "Professor" },
      { id: "f_ar", name: "Prof. Arjun Mehta", dept: "Mechanical", email: "arjun.mehta@campus.edu", phone: "9876500013", designation: "Assistant Professor" },
      { id: "f_pd", name: "Dr. Priya Desai", dept: "Mathematics", email: "priya.desai@campus.edu", phone: "9876500014", designation: "Professor" },
    ],
    students: [
      { id: "s_mi", rollNo: "CS21-104", name: "Meera Iyer", dept: "Computer Science", year: 3, email: "meera.iyer@campus.edu", phone: "9123400001", gpa: 8.7 },
      { id: "s_rk", rollNo: "CS21-118", name: "Rohan Kulkarni", dept: "Computer Science", year: 3, email: "rohan.k@campus.edu", phone: "9123400002", gpa: 8.1 },
      { id: "s_as", rollNo: "EC22-042", name: "Aisha Siddiqui", dept: "Electronics", year: 2, email: "aisha.s@campus.edu", phone: "9123400003", gpa: 9.0 },
      { id: "s_jp", rollNo: "ME20-077", name: "Jay Patel", dept: "Mechanical", year: 4, email: "jay.p@campus.edu", phone: "9123400004", gpa: 7.6 },
      { id: "s_tn", rollNo: "CS22-009", name: "Tanvi Nair", dept: "Computer Science", year: 2, email: "tanvi.n@campus.edu", phone: "9123400005", gpa: 8.9 },
      { id: "s_kb", rollNo: "EC21-055", name: "Kunal Bhatia", dept: "Electronics", year: 3, email: "kunal.b@campus.edu", phone: "9123400006", gpa: 7.9 },
    ],
    courses: [
      { id: "c_dsa", code: "CS301", name: "Data Structures", dept: "Computer Science", credits: 4, facultyId: "f_vs", semester: "Odd 2026" },
      { id: "c_dbms", code: "CS305", name: "Database Systems", dept: "Computer Science", credits: 4, facultyId: "f_vs", semester: "Odd 2026" },
      { id: "c_dsp", code: "EC210", name: "Digital Signal Processing", dept: "Electronics", credits: 3, facultyId: "f_nk", semester: "Odd 2026" },
      { id: "c_tom", code: "ME320", name: "Theory of Machines", dept: "Mechanical", credits: 4, facultyId: "f_ar", semester: "Odd 2026" },
      { id: "c_la", code: "MA201", name: "Linear Algebra", dept: "Mathematics", credits: 3, facultyId: "f_pd", semester: "Odd 2026" },
    ],
    enrollments: [
      { studentId: "s_mi", courseId: "c_dsa" },
      { studentId: "s_mi", courseId: "c_dbms" },
      { studentId: "s_mi", courseId: "c_la" },
      { studentId: "s_rk", courseId: "c_dsa" },
      { studentId: "s_rk", courseId: "c_dbms" },
      { studentId: "s_tn", courseId: "c_dsa" },
      { studentId: "s_as", courseId: "c_dsp" },
      { studentId: "s_as", courseId: "c_la" },
      { studentId: "s_kb", courseId: "c_dsp" },
      { studentId: "s_jp", courseId: "c_tom" },
    ],
    attendance: [
      { id: "a1", courseId: "c_dsa", date: "2026-09-22", records: { s_mi: "P", s_rk: "P", s_tn: "A" } },
      { id: "a2", courseId: "c_dsa", date: "2026-09-24", records: { s_mi: "P", s_rk: "P", s_tn: "P" } },
      { id: "a3", courseId: "c_dsa", date: "2026-09-26", records: { s_mi: "P", s_rk: "A", s_tn: "P" } },
      { id: "a4", courseId: "c_dbms", date: "2026-09-23", records: { s_mi: "P", s_rk: "P" } },
      { id: "a5", courseId: "c_dbms", date: "2026-09-25", records: { s_mi: "A", s_rk: "P" } },
      { id: "a6", courseId: "c_la", date: "2026-09-22", records: { s_mi: "P", s_as: "P" } },
    ],
    marks: [
      { id: "m1", courseId: "c_dsa", exam: "Midterm", max: 50, scores: { s_mi: 44, s_rk: 38, s_tn: 41 } },
      { id: "m2", courseId: "c_dbms", exam: "Quiz 1", max: 20, scores: { s_mi: 17, s_rk: 15 } },
      { id: "m3", courseId: "c_la", exam: "Midterm", max: 50, scores: { s_mi: 46, s_as: 48 } },
    ],
    notices: [
      { id: "n1", title: "Odd semester midterms", body: "Midterm examinations begin 14 October. Hall tickets will be available on the portal from 8 October.", audience: "all", date: "2026-09-28", author: "Dr. Ananya Rao" },
      { id: "n2", title: "Library hours extended", body: "Central library will remain open until 11 PM during the exam window.", audience: "all", date: "2026-09-30", author: "Admin Office" },
      { id: "n3", title: "Dept. seminar: Graph algorithms", body: "Guest lecture by Dr. S. Menon in Seminar Hall B, 6 October, 3 PM. Attendance is credited for CS301.", audience: "faculty", date: "2026-10-01", author: "Prof. Vikram Shah" },
    ],
  };
}

export function loadDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const seed = seedDatabase();
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

export function saveDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export { hashPassword, id };
