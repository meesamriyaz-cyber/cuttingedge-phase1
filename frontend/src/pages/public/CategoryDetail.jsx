import { useParams } from "react-router-dom";

import { getCategoryBySlug, getCrafts } from "../../api/public.api.js";
import ContentGrid from "../../components/public/ContentGrid.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { BackLink, DetailFrame, DetailMedia, listFrom } from "./PublicHelpers.jsx";

export default function CategoryDetail() {
  const { slug } = useParams();
  const state = useAsync(async () => {
    const category = await getCategoryBySlug(slug);
    const crafts = await getCrafts({ category: category._id });
    return { category, crafts: listFrom(crafts, "crafts") };
  }, [slug]);

  return (
    <section className="page detail">
      <DetailFrame state={state}>
        <div className="detail-hero">
          <div>
            <p className="eyebrow">Collection</p>
            <h1>{state.data?.category.name}</h1>
            <p className="muted">{state.data?.category.shortDescription}</p>
            <div className="detail-actions">
              <BackLink to="/categories" label="Collections" />
            </div>
          </div>
          <DetailMedia item={state.data?.category} />
        </div>
        <div className="detail-section">
          <h2>Crafts in this collection</h2>
          <ContentGrid items={state.data?.crafts} type="crafts" />
        </div>
      </DetailFrame>
    </section>
  );
}
