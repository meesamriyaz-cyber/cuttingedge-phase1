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
import { imageFrom, listFrom } from "./PublicHelpers.jsx";

const HeritageScene = lazy(() => import("../../components/public/HeritageScene.jsx"));

const MEMORY_LANE_ITEMS = [
  {
    id: "memory-1896",
    era: "1896",
    title: "A maker's studio",
    text: "An archival glimpse of a Kashmiri woodcarver surrounded by carved screens, bookcases, and vessels.",
    profilePhoto: "https://upload.wikimedia.org/wikipedia/commons/4/46/Kashmir_Wood_Carver_-_Fred_Bremner.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kashmir_Wood_Carver_-_Fred_Bremner.jpg",
    credit: "Fred Bremner / Public domain"
  },
  {
    id: "memory-now",
    era: "Today",
    title: "The hand remembers",
    text: "A woodcarver in Srinagar keeps the rhythm of Kashmiri carving alive in the present day.",
    profilePhoto: "https://upload.wikimedia.org/wikipedia/commons/8/84/Kashmir_Woodcarver.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kashmir_Woodcarver.jpg",
    credit: "AjarnRichard / CC BY-SA 4.0"
  }
];

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

  const memoryLaneArtisans = (data?.artisans || []).filter((artisan) => imageFrom(artisan)).slice(0, 3);

  return (
    <>
      <section className="hero">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">Phase I cultural archive</p>
          <h1>
            Kashmiri
            <span> Arts</span>
          </h1>
          <p className="hero-lede">
            A living introduction to Kashmiri crafts, their histories, and the artisans carrying them forward for a wider
            world to understand.
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
        </motion.div>
        <motion.div
          className="hero-art"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Interactive Kashmir arts carousel"
        >
          <Suspense fallback={<div className="heritage-scene heritage-scene-fallback" />}>
            <HeritageScene />
          </Suspense>
        </motion.div>
      </section>

      <motion.section
        className="phase-intro"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="phase-intro-copy">
          <p className="eyebrow">Curtain raiser</p>
          <h2>Understanding Kashmir through the eyes of its artisans.</h2>
          <p>
            Behind every carved line, woven thread, and hammered form is a person carrying memory, place, and pride.
            This archive brings those voices closer to the world.
          </p>
        </div>
        <MemoryLane artisans={memoryLaneArtisans} />
      </motion.section>

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
          <HomeSection title="Browse collections" to="/categories">
            <ContentGrid items={data.categories} type="categories" />
          </HomeSection>
        </>
      ) : null}
    </>
  );
}

function MemoryLane({ artisans = [] }) {
  const items = artisans.length
    ? artisans.map((artisan, index) => ({
        id: artisan._id || artisan.slug || artisan.name,
        era: index === 0 ? "Living archive" : "Artisan voice",
        title: artisan.name,
        text: artisan.biography || "A contemporary artisan carrying Kashmiri craft into the present.",
        profilePhoto: imageFrom(artisan),
        to: artisan.slug ? `/artisans/${artisan.slug}` : "",
        credit: [artisan.village, artisan.district].filter(Boolean).join(", ")
      }))
    : MEMORY_LANE_ITEMS;

  return (
    <div className="memory-lane" aria-label="Kashmiri craft memory lane">
      <div className="memory-lane-header">
        <span>Memory lane</span>
        <p>
          {artisans.length
            ? "Real faces from the archive, carrying Kashmiri craft through memory, place, and practice."
            : "From old studios to living hands, Kashmiri craft moves through generations."}
        </p>
      </div>
      <div className="memory-lane-track">
        {items.slice(0, 3).map((item) => {
        const content = (
          <>
            <div className="memory-lane-media">
              {item.profilePhoto ? <img src={item.profilePhoto} alt={item.title} /> : <span>{item.title?.[0] || "K"}</span>}
            </div>
            <div className="memory-lane-copy">
              <small>{item.era}</small>
              <span>{item.title}</span>
              <p>{trimIntro(item.text)}</p>
              {item.credit ? <em>{item.credit}</em> : null}
            </div>
          </>
        );

        if (item.to) {
          return (
            <Link className="memory-lane-item" to={item.to} key={item.id}>
              {content}
            </Link>
          );
        }

        if (item.sourceUrl) {
          return (
          <a
            className="memory-lane-item"
            href={item.sourceUrl}
            key={item.id}
            rel="noreferrer"
            target="_blank"
          >
            {content}
          </a>
          );
        }

        return (
          <div className="memory-lane-item" key={item.id}>
            {content}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function trimIntro(value = "") {
  return value.length > 118 ? `${value.slice(0, 118).trim()}...` : value;
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
