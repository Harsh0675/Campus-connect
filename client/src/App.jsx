import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import Faculty from "./pages/Faculty.jsx";
import Courses from "./pages/Courses.jsx";
import Attendance from "./pages/Attendance.jsx";
import Marks from "./pages/Marks.jsx";
import Notices from "./pages/Notices.jsx";

function Guard({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="main">Loading CampusConnect…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/notices" element={<Notices />} />
      </Route>
    </Routes>
  );
}
