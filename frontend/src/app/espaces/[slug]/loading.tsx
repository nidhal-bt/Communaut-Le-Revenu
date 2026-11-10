import { CategoryHeaderSkeleton } from "@/components/category/category-header";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";

/** Les deux squelettes que la page donne déjà à ses frontières, dans son gabarit. */
export default function SpaceLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <CategoryHeaderSkeleton />
      <FeedSkeleton />
    </div>
  );
}
