import { useMemo, useState } from "react";

import { getArticles } from "../../api/public.api.js";
import ContentGrid from "../../components/public/ContentGrid.jsx";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { listFrom, PageHero, SearchBar } from "./PublicHelpers.jsx";

export default function Articles() {
  const [search, setSearch] = useState("");
  const query = useMemo(() => ({ search }), [search]);
  const { data, loading, error } = useAsync(() => getArticles(query), [query]);

  return (
    <section className="page">
      <PageHero eyebrow="Journal" title="Stories">
        Histories, field notes, and cultural context from the archive.
      </PageHero>
      <SearchBar value={search} onChange={setSearch} placeholder="Search stories" />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} /> : null}
      {data ? <ContentGrid items={listFrom(data, "articles")} type="articles" /> : null}
    </section>
  );
}
