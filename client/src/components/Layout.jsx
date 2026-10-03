import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/faculty", label: "Faculty" },
  { to: "/courses", label: "Courses" },
  { to: "/attendance", label: "Attendance" },
  { to: "/marks", label: "Marks" },
  { to: "/notices", label: "Notices" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          Campus<span>Connect</span>
        </div>
        <div className="role-chip">{user.role}</div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="spacer" />
        <div className="user-block">
          <strong>{user.name}</strong>
          <div>{user.email}</div>
          <button className="btn ghost" style={{ marginTop: 10, paddingLeft: 0 }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
