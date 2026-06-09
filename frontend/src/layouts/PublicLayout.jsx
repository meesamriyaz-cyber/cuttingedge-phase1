import { lazy, Suspense } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { label: "Crafts", to: "/crafts" },
  { label: "Artisans", to: "/artisans" },
  { label: "Stories", to: "/articles" },
  { label: "Collections", to: "/categories" }
];

const SiteAtmosphere = lazy(() => import("../components/public/SiteAtmosphere.jsx"));

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="site-shell">
      <Suspense fallback={null}>
        <SiteAtmosphere />
      </Suspense>
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">KA</span>
          <span>Kashmiri Arts Archive</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
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
