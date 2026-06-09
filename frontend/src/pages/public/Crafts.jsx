import { useMemo, useState } from "react";

import { getCrafts } from "../../api/public.api.js";
import ContentGrid from "../../components/public/ContentGrid.jsx";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { listFrom, PageHero, SearchBar } from "./PublicHelpers.jsx";

export default function Crafts() {
  const [search, setSearch] = useState("");
  const query = useMemo(() => ({ search }), [search]);
  const { data, loading, error } = useAsync(() => getCrafts(query), [query]);

  return (
    <section className="page">
      <PageHero eyebrow="Traditions" title="Crafts">
        Discover materials, techniques, histories, and places behind Kashmiri handwork.
      </PageHero>
      <SearchBar value={search} onChange={setSearch} placeholder="Search crafts" />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} /> : null}
      {data ? <ContentGrid items={listFrom(data, "crafts")} type="crafts" /> : null}
    </section>
  );
}
