import { useMemo, useState } from "react";

import { getCategories } from "../../api/public.api.js";
import ContentGrid from "../../components/public/ContentGrid.jsx";
import { ErrorState, LoadingState } from "../../components/ui/Status.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { listFrom, PageHero, SearchBar } from "./PublicHelpers.jsx";

export default function Categories() {
  const [search, setSearch] = useState("");
  const query = useMemo(() => ({ search }), [search]);
  const { data, loading, error } = useAsync(() => getCategories(query), [query]);

  return (
    <section className="page">
      <PageHero eyebrow="Archive" title="Collections">
        Browse craft families, material traditions, and cultural groupings.
      </PageHero>
      <SearchBar value={search} onChange={setSearch} placeholder="Search collections" />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} /> : null}
      {data ? <ContentGrid items={listFrom(data, "categories")} type="categories" /> : null}
    </section>
  );
}
