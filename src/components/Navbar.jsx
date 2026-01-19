import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `nav__link ${isActive ? "nav__link--active" : ""}`;

  return (
    <nav className="nav">
      <div className="nav__inner">
        <div className="brand">
          <div className="brand__title">📚 Biblioteka</div>
          <div className="brand__tag">vintage edition</div>
        </div>

        <div className="nav__links">
          <NavLink className={linkClass} to="/">
            Home
          </NavLink>

          {/* Admin link je smisleno vidljiv samo adminu */}
          {user?.role === "admin" && (
            <NavLink className={linkClass} to="/admin">
              Admin
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink className={linkClass} to="/stats">
              Stats
            </NavLink>
          )}

          {user && (
            <NavLink className={linkClass} to="/my-loans">
              My loans
            </NavLink>
          )}

          {!user && (
            <>
              <NavLink className={linkClass} to="/login">
                Login
              </NavLink>
              <NavLink className={linkClass} to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <>
              <span className="pill">
                {user.name} ({user.role})
              </span>
              <button className="btn btn--primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <span className="pill">Guest</span>
          )}
        </div>
      </div>
    </nav>
  );
}
