import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { QuickComposerSkeleton } from "./_components/quick-composer";

/**
 * Repli de la route, à distinguer des `<Suspense>` que la page porte déjà : il
 * entoure la page entière, et ne s'affiche donc que si la coquille n'est pas encore
 * là. Mêmes squelettes que `page.tsx`, pour que la bascule ne se voie pas.
 */
export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <QuickComposerSkeleton />
      <FeedSkeleton />
    </div>
  );
}
