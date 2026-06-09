import { Link } from "react-router-dom";

import { getDashboard } from "../../api/admin.api.js";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";
import { useAsync } from "../../hooks/useAsync.js";

const labels = {
  categories: "Categories",
  crafts: "Crafts",
  artisans: "Artisans",
  articles: "Articles",
  media: "Media"
};

export default function Dashboard() {
  const { data, loading, error } = useAsync(getDashboard, []);

  return (
    <section className="admin-page">
      <div className="admin-actions">
        <div>
          <p className="eyebrow">CMS</p>
          <h1>Dashboard</h1>
        </div>
      </div>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} /> : null}
      {data ? (
        <>
          <div className="stats-grid">
            {Object.entries(data.counts || {}).map(([key, value]) => (
              <div className="stat-card" key={key}>
                <span>{labels[key] || key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <DashboardList title="Featured crafts" items={data.featuredCrafts} to="/admin/crafts" labelKey="name" />
          <DashboardList title="Recent articles" items={data.recentArticles} to="/admin/articles" labelKey="title" />
          <DashboardList title="Recent media" items={data.recentMedia} to="/admin/media" labelKey="fileName" />
        </>
      ) : null}
    </section>
  );
}

function DashboardList({ title, items = [], to, labelKey }) {
  return (
    <section className="admin-panel">
      <div className="section-header">
        <h2>{title}</h2>
        <Link className="button button-secondary" to={to}>Manage</Link>
      </div>
      {items.length ? (
        <div className="pill-row">
          {items.map((item) => (
            <span className="pill" key={item._id || item.slug || item[labelKey]}>{item[labelKey]}</span>
          ))}
        </div>
      ) : (
        <p className="muted">Nothing here yet.</p>
      )}
    </section>
  );
}
