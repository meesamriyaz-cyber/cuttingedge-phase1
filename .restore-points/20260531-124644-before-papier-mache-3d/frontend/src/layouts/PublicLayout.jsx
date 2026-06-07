import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Crafts", to: "/crafts" },
  { label: "Artisans", to: "/artisans" },
  { label: "Articles", to: "/articles" },
  { label: "Categories", to: "/categories" }
];

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">KA</span>
          <span>Kashmiri Arts</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link className="icon-link" to="/admin/login" aria-label="Admin login">
          <LockKeyhole size={18} />
        </Link>
      </header>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
