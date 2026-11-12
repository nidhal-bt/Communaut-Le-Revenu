import { CategoryHeaderSkeleton } from "@/components/category/category-header";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export default function SpaceLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <CategoryHeaderSkeleton />
      <FeedSkeleton />
    </div>
  );
}
