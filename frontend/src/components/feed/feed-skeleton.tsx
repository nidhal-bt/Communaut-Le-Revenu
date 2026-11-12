import { SkeletonBar } from "@/components/layout/right-rail/skeleton-bar";
import { FEED_SHELL } from "./feed-list";
import { FeedTabsSkeleton } from "./feed-tabs";
import { FeedViewToggleSkeleton } from "./feed-view-toggle";

const ROWS = [0, 1, 2, 3];

/** La liste seule, sans la barre d'onglets : ce dont la recherche a besoin. */
export const FeedListSkeleton = () => (
  <div aria-hidden className={FEED_SHELL}>
    {ROWS.map((row) => (
      <div
        key={row}
        className="grid grid-cols-[minmax(0,1fr)] gap-2 border-t border-border-divider px-4 py-3.5 first:border-t-0 md:grid-cols-[62px_minmax(0,1fr)] md:gap-4 md:px-[18px] md:py-4"
      >
        <span className="hidden h-[58px] w-[62px] rounded-sm bg-accent md:block" />
        <div className="flex flex-col gap-2.5">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-3 w-full" />
          <SkeletonBar className="h-3 w-32" />
        </div>
      </div>
    ))}
  </div>
);

export const FeedSkeleton = () => (
  <div aria-hidden className="flex flex-col gap-[18px]">
    <div className="flex items-center justify-between gap-3">
      <FeedTabsSkeleton />
      <FeedViewToggleSkeleton />
    </div>

    <FeedListSkeleton />
  </div>
);
