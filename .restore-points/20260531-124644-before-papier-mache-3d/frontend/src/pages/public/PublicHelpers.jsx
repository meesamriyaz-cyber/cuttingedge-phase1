import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";

import Button from "../../components/ui/Button.jsx";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";

export const listFrom = (data, key) => data?.[key] || [];

export const imageFrom = (item) =>
  item?.heroImage || item?.coverImage || item?.profilePhoto || item?.featuredImage || "";

export const introFrom = (item) =>
  item?.shortDescription || item?.excerpt || item?.biography || "";

export function PageHero({ eyebrow, title, children }) {
  return (
    <motion.section
      className="page-hero"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
    </motion.section>
  );
}

export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      <Button variant="secondary" type="button" aria-label="Search">
        <Search size={17} />
      </Button>
    </div>
  );
}

export function DetailFrame({ state, children }) {
  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState error={state.error} />;
  return children;
}

export function BackLink({ to, label }) {
  return (
    <Link className="button button-secondary" to={to}>
      <ArrowLeft size={17} />
      {label}
    </Link>
  );
}

export function DetailMedia({ item }) {
  const image = imageFrom(item);

  return (
    <div className="detail-media">
      {image ? <img src={image} alt={item?.name || item?.title} /> : null}
    </div>
  );
}
