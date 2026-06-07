import { useMemo, useState } from "react";

import { getArtisans } from "../../api/public.api.js";
import ContentGrid from "../../components/public/ContentGrid.jsx";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { listFrom, PageHero, SearchBar } from "./PublicHelpers.jsx";

export default function Artisans() {
  const [search, setSearch] = useState("");
  const query = useMemo(() => ({ search }), [search]);
  const { data, loading, error } = useAsync(() => getArtisans(query), [query]);

  return (
    <section className="page">
      <PageHero eyebrow="People" title="Artisans">
        Meet makers carrying technique, memory, and place into the present.
      </PageHero>
      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, village, or district" />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} /> : null}
      {data ? <ContentGrid items={listFrom(data, "artisans")} type="artisans" /> : null}
    </section>
  );
}
