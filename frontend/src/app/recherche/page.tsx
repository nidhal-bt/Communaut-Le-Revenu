import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchX } from "lucide-react";
import { DiscussionCard } from "@/components/feed/discussion-card";
import { FEED_SHELL } from "@/components/feed/feed-list";
import { FeedPagination } from "@/components/feed/feed-pagination";
import { FeedListSkeleton } from "@/components/feed/feed-skeleton";
import { StateCard } from "@/components/state-card";
import { feedHref, resolveFeedPage } from "@/lib/feed-url";
import { searchDiscussions } from "@/lib/strapi/discussions";
import { SearchField, SearchHeader } from "./_components/search-shell";

export const metadata: Metadata = {
  title: "Rechercher",
  description:
    "Retrouvez une discussion de la Communauté Le Revenu par son titre ou son contenu.",
};

/** En dessous de deux caractères, « a » ramènerait la moitié du fil. */
const MIN_QUERY_LENGTH = 2;

/** Les suggestions de la maquette, pour une recherche encore vide. */
const SUGGESTIONS = [
  "PEA",
  "assurance-vie",
  "donation",
  "SCPI",
  "PER",
  "frais réels",
];

/** La `.chip` de la maquette. Un lien, donc : aucun JavaScript à charger. */
const CHIP =
  "inline-flex items-center rounded-full border bg-card px-[13px] py-1.5 text-[13.5px] font-medium whitespace-nowrap text-foreground-secondary shadow-lift hover:border-border-strong hover:text-foreground";

const Suggestions = () => (
  <div className="flex flex-wrap gap-2">
    {SUGGESTIONS.map((suggestion) => (
      <Link
        key={suggestion}
        href={`/recherche?q=${encodeURIComponent(suggestion)}`}
        className={CHIP}
      >
        {suggestion}
      </Link>
    ))}
  </div>
);

/**
 * La lecture elle-même, sous sa propre frontière : le champ est déjà à l'écran
 * et n'a pas à attendre Strapi.
 */
const Results = async ({ query, page }: { query: string; page: number }) => {
  const result = await searchDiscussions(query, page);

  if ("failed" in result) {
    return (
      <StateCard
        icon={<SearchX className="size-5" />}
        title="La recherche n'a pas abouti"
        description="La communauté est momentanément injoignable. Réessayez dans un instant."
      />
    );
  }

  const { discussions, pageCount, total } = result;

  /* Une page au-delà de la dernière est ramenée sur la dernière, comme dans le
     fil : sinon une recherche pleine de résultats s'annoncerait vide. `q` est
     reposé plutôt que conservé — `searchParams` n'est pas lu ici. */
  if (pageCount > 0 && page > pageCount) {
    redirect(
      feedHref("/recherche", new URLSearchParams({ q: query }), {
        page: pageCount,
      }),
    );
  }

  if (total === 0) {
    return (
      <StateCard
        title="Aucune discussion trouvée"
        description="Posez la question à la communauté : quelqu'un a sûrement vécu la même situation."
      />
    );
  }

  return (
    <>
      <p className="text-sm text-foreground-secondary">
        <b className="font-semibold tabular-nums text-foreground">{total}</b>{" "}
        {total > 1 ? "résultats" : "résultat"} pour « {query} »
      </p>

      <div className={FEED_SHELL}>
        {discussions.map((discussion) => (
          <DiscussionCard key={discussion.documentId} discussion={discussion} />
        ))}
      </div>

      <FeedPagination pageCount={pageCount} />
    </>
  );
};

/**
 * `searchParams` est attendu *ici*, pas dans le corps de la page : une lecture
 * de la requête là-haut rendrait la route dynamique en entier et l'en-tête
 * perdrait son pré-rendu. Même découpage que `FeedSection`.
 */
const SearchSection = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  if (query.length < MIN_QUERY_LENGTH) {
    return (
      <>
        <SearchField query={query} />
        <Suggestions />
      </>
    );
  }

  return (
    <>
      <SearchField query={query} />

      <Suspense fallback={<FeedListSkeleton />}>
        <Results
          query={query}
          page={resolveFeedPage(typeof page === "string" ? page : undefined)}
        />
      </Suspense>
    </>
  );
};

export default function SearchPage({ searchParams }: PageProps<"/recherche">) {
  return (
    <div className="flex flex-col gap-[18px]">
      <SearchHeader />

      <Suspense fallback={<SearchField query="" />}>
        <SearchSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
