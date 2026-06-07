import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import ContentGrid from "../../components/public/ContentGrid.jsx";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import {
  getCategories,
  getFeaturedArticles,
  getFeaturedArtisans,
  getFeaturedCrafts
} from "../../api/public.api.js";
import { listFrom } from "./PublicHelpers.jsx";

const HeritageScene = lazy(() => import("../../components/public/HeritageScene.jsx"));

export default function Home() {
  const { data, loading, error } = useAsync(async () => {
    const [crafts, artisans, articles, categories] = await Promise.all([
      getFeaturedCrafts(),
      getFeaturedArtisans(),
      getFeaturedArticles(),
      getCategories({ limit: 6 })
    ]);

    return {
      crafts,
      artisans,
      articles,
      categories: listFrom(categories, "categories")
    };
  }, []);

  return (
    <>
      <section className="hero">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">Living heritage of Kashmir</p>
          <h1>
            Kashmiri
            <span> Arts</span>
          </h1>
          <p className="hero-lede">
            Explore handwork traditions, master artisans, and cultural stories from the valley in one curated
            digital archive.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/crafts">
              <Sparkles size={17} />
              Explore crafts
            </Link>
            <Link className="button button-secondary" to="/artisans">
              Meet artisans
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-metrics" aria-label="Archive highlights">
            <span><strong>4</strong> collections</span>
            <span><strong>CMS</strong> ready</span>
            <span><strong>3D</strong> motion</span>
          </div>
        </motion.div>
        <motion.div
          className="hero-art"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Animated thread sculpture"
        >
          <Suspense fallback={<div className="heritage-scene heritage-scene-fallback" />}>
            <HeritageScene />
          </Suspense>
        </motion.div>
      </section>

      {loading ? <section className="section"><LoadingState /></section> : null}
      {error ? <section className="section"><ErrorState error={error} /></section> : null}
      {data ? (
        <>
          <HomeSection title="Featured crafts" to="/crafts">
            <ContentGrid items={data.crafts} type="crafts" />
          </HomeSection>
          <HomeSection title="Artisans to know" to="/artisans">
            <ContentGrid items={data.artisans} type="artisans" />
          </HomeSection>
          <HomeSection title="Latest stories" to="/articles">
            <ContentGrid items={data.articles} type="articles" />
          </HomeSection>
          <HomeSection title="Browse categories" to="/categories">
            <ContentGrid items={data.categories} type="categories" />
          </HomeSection>
        </>
      ) : null}
    </>
  );
}

function HomeSection({ title, to, children }) {
  return (
    <motion.section
      className="section"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="section-header">
        <h2>{title}</h2>
        <Link className="button button-secondary" to={to}>
          View all
          <ArrowRight size={17} />
        </Link>
      </div>
      {children}
    </motion.section>
  );
}
