import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { EmptyState } from "../ui/Status.jsx";

const getImage = (item) =>
  item.heroImage ||
  item.coverImage ||
  item.profilePhoto ||
  item.featuredImage ||
  "";

const getDescription = (item) =>
  item.shortDescription || item.excerpt || item.biography || "";

export default function ContentGrid({ items = [], type }) {
  if (!items.length) {
    return <EmptyState label="New stories will appear here soon" />;
  }

  return (
    <motion.div
      className="content-grid"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.075
          }
        }
      }}
    >
      {items.map((item) => (
        <motion.div
          key={item._id || item.slug}
          variants={{
            hidden: { opacity: 0, y: 26 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
        <Link className="content-card" to={`/${type}/${item.slug}`}>
          <div className="content-card-media">
            {getImage(item) ? (
              <img src={getImage(item)} alt={item.name || item.title} />
            ) : (
              <span>{item.name?.[0] || item.title?.[0] || "K"}</span>
            )}
          </div>
          <div className="content-card-body">
            <h3>{item.name || item.title}</h3>
            {getDescription(item) ? <p>{getDescription(item)}</p> : null}
          </div>
        </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
