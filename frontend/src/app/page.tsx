import { Suspense } from "react";
import { FeedSection } from "@/components/feed/feed-section";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { CategoryFilterSkeleton } from "./_components/category-filter";
import { CategoryFilterSection } from "./_components/category-filter-section";
import { Hero } from "./_components/hero";
import { QuickComposerSkeleton } from "./_components/quick-composer";
import { QuickComposerSection } from "./_components/quick-composer-section";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-[18px]">
      <Hero />
      {/* Avec `cacheComponents` le cache est opt-in, et `searchParams` est une
          lecture de la requête : chacun vit donc sous sa propre frontière, sinon
          le build signale la route comme bloquante. */}
      <Suspense fallback={<QuickComposerSkeleton />}>
        <QuickComposerSection />
      </Suspense>
      <Suspense fallback={<CategoryFilterSkeleton />}>
        <CategoryFilterSection />
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedSection pathname="/" searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
