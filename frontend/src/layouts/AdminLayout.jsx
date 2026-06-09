import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Categories", to: "/admin/categories" },
  { label: "Crafts", to: "/admin/crafts" },
  { label: "Artisans", to: "/admin/artisans" },
  { label: "Articles", to: "/admin/articles" },
  { label: "Media", to: "/admin/media" }
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <LayoutDashboard size={20} />
          <span>CMS</span>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost-button" type="button" onClick={handleLogout}>
          <LogOut size={16} />
          <span>{user?.name || "Logout"}</span>
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
