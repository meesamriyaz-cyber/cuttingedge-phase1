import { useParams } from "react-router-dom";

import { getArtisanBySlug } from "../../api/public.api.js";
import ContentGrid from "../../components/public/ContentGrid.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { BackLink, DetailFrame, DetailMedia } from "./PublicHelpers.jsx";

export default function ArtisanDetail() {
  const { slug } = useParams();
  const state = useAsync(() => getArtisanBySlug(slug), [slug]);
  const artisan = state.data;

  return (
    <section className="page detail">
      <DetailFrame state={state}>
        <div className="detail-hero">
          <div>
            <p className="eyebrow">{[artisan?.village, artisan?.district].filter(Boolean).join(", ") || "Artisan"}</p>
            <h1>{artisan?.name}</h1>
            <p className="muted">{artisan?.biography}</p>
            <div className="pill-row">
              {artisan?.yearsOfExperience ? <span className="pill">{artisan.yearsOfExperience} years</span> : null}
              {artisan?.awards?.map((award) => <span className="pill" key={award}>{award}</span>)}
            </div>
            <div className="detail-actions">
              <BackLink to="/artisans" label="Artisans" />
            </div>
          </div>
          <DetailMedia item={artisan} />
        </div>
        <div className="detail-section">
          <h2>Crafts practiced</h2>
          <ContentGrid items={artisan?.craftIds || []} type="crafts" />
        </div>
      </DetailFrame>
    </section>
  );
}
