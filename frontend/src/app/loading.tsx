import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { QuickComposerSkeleton } from "./_components/quick-composer";

/**
 * Repli de la route, à distinguer des `<Suspense>` que la page porte déjà : il
 * entoure la page entière, et ne s'affiche donc que si la coquille elle-même
 * n'est pas encore là.
 *
 * Mêmes squelettes et même gabarit que `page.tsx`, à dessein : les deux images
 * se superposent, et la bascule de l'un à l'autre ne se voit pas. Le hero n'y
 * figure pas — son propre repli est `null` le temps de lire la session.
 */
export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <QuickComposerSkeleton />
      <FeedSkeleton />
    </div>
  );
}
