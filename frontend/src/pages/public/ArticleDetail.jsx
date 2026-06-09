import { Link, useParams } from "react-router-dom";

import { getArticleBySlug } from "../../api/public.api.js";
import { useAsync } from "../../hooks/useAsync.js";
import { BackLink, DetailFrame, DetailMedia } from "./PublicHelpers.jsx";

const formatDate = (date) =>
  date ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(date)) : "";

export default function ArticleDetail() {
  const { slug } = useParams();
  const state = useAsync(() => getArticleBySlug(slug), [slug]);
  const article = state.data;

  return (
    <section className="page detail">
      <DetailFrame state={state}>
        <div className="detail-hero">
          <div>
            <p className="eyebrow">{article?.articleType} {formatDate(article?.publishDate)}</p>
            <h1>{article?.title}</h1>
            <p className="muted">{article?.excerpt}</p>
            <div className="detail-actions">
              <BackLink to="/articles" label="Stories" />
              {article?.relatedCraft?.slug ? (
                <Link className="button button-secondary" to={`/crafts/${article.relatedCraft.slug}`}>
                  Related craft
                </Link>
              ) : null}
              {article?.relatedArtisan?.slug ? (
                <Link className="button button-secondary" to={`/artisans/${article.relatedArtisan.slug}`}>
                  Related artisan
                </Link>
              ) : null}
            </div>
          </div>
          <DetailMedia item={article} />
        </div>
        <article className="detail-section article-content">{article?.content}</article>
      </DetailFrame>
    </section>
  );
}
