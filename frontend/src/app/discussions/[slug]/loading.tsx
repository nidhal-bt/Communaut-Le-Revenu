import { DiscussionPostSkeleton } from "@/components/discussion/discussion-post";
import { RepliesSkeleton } from "@/components/discussion/replies-section";

export default function DiscussionLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <DiscussionPostSkeleton />
      <RepliesSkeleton />
    </div>
  );
}
