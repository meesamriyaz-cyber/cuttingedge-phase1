import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Home from "./pages/public/Home.jsx";
import Categories from "./pages/public/Categories.jsx";
import CategoryDetail from "./pages/public/CategoryDetail.jsx";
import Crafts from "./pages/public/Crafts.jsx";
import CraftDetail from "./pages/public/CraftDetail.jsx";
import Artisans from "./pages/public/Artisans.jsx";
import ArtisanDetail from "./pages/public/ArtisanDetail.jsx";
import Articles from "./pages/public/Articles.jsx";
import ArticleDetail from "./pages/public/ArticleDetail.jsx";
import Login from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminResource from "./pages/admin/AdminResource.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:slug" element={<CategoryDetail />} />
        <Route path="crafts" element={<Crafts />} />
        <Route path="crafts/:slug" element={<CraftDetail />} />
        <Route path="artisans" element={<Artisans />} />
        <Route path="artisans/:slug" element={<ArtisanDetail />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:slug" element={<ArticleDetail />} />
      </Route>

      <Route path="admin/login" element={<Login />} />
      <Route
        path="admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<AdminResource resource="categories" />} />
        <Route path="crafts" element={<AdminResource resource="crafts" />} />
        <Route path="artisans" element={<AdminResource resource="artisans" />} />
        <Route path="articles" element={<AdminResource resource="articles" />} />
        <Route path="media" element={<AdminResource resource="media" />} />
      </Route>
    </Routes>
  );
}
