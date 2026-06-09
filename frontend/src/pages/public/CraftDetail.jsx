import { Link, useParams } from "react-router-dom";

import { getCraftBySlug } from "../../api/public.api.js";
import ContentGrid from "../../components/public/ContentGrid.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { BackLink, DetailFrame, DetailMedia } from "./PublicHelpers.jsx";

export default function CraftDetail() {
  const { slug } = useParams();
  const state = useAsync(() => getCraftBySlug(slug), [slug]);
  const craft = state.data?.craft;

  return (
    <section className="page detail">
      <DetailFrame state={state}>
        <div className="detail-hero">
          <div>
            <p className="eyebrow">{craft?.category?.name || "Craft"}</p>
            <h1>{craft?.name}</h1>
            <p className="muted">{craft?.shortDescription}</p>
            <div className="detail-actions">
              <BackLink to="/crafts" label="Crafts" />
              {craft?.category?.slug ? (
                <Link className="button button-secondary" to={`/categories/${craft.category.slug}`}>
                  View collection
                </Link>
              ) : null}
            </div>
          </div>
          <DetailMedia item={craft} />
        </div>
        <TextBlock title="Overview">{craft?.description}</TextBlock>
        <TextBlock title="History">{craft?.history}</TextBlock>
        <TextBlock title="Making process">{craft?.makingProcess}</TextBlock>
        <TextBlock title="Geographical significance">{craft?.geographicalSignificance}</TextBlock>
        <div className="detail-section">
          <h2>Related artisans</h2>
          <ContentGrid items={state.data?.artisans || []} type="artisans" />
        </div>
      </DetailFrame>
    </section>
  );
}

function TextBlock({ title, children }) {
  if (!children) return null;
  return (
    <div className="detail-section">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
