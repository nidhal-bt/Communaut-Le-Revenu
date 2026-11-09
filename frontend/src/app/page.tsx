import { Suspense } from "react";
import { FeedSection } from "@/components/feed/feed-section";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { Hero } from "./_components/hero";
import { QuickComposerSkeleton } from "./_components/quick-composer";
import { QuickComposerSection } from "./_components/quick-composer-section";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    /* Ordre de `viewHome()` dans la maquette : le hero (ou rien, une fois
       connecté), la barre de publication, puis les onglets et le fil.
       `gap-[18px]` reprend le rythme vertical du rail droit. */
    <div className="flex flex-col gap-[18px]">
      <Hero />
      {/* Ni les espaces ni les discussions ne sont lus de façon pré-rendable —
          avec `cacheComponents`, le cache est opt-in, et `searchParams` est une
          lecture de la requête : chacun vit donc sous sa propre frontière
          `<Suspense>`, sinon le build signale la route comme bloquante. */}
      <Suspense fallback={<QuickComposerSkeleton />}>
        <QuickComposerSection />
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
