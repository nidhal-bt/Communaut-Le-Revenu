import { DiscussionPostSkeleton } from "@/components/discussion/discussion-post";
import { RepliesSkeleton } from "@/components/discussion/replies-section";

/**
 * Les deux premiers squelettes de la page, dans son gabarit. Le bloc « À lire
 * aussi » n'en a pas : son repli est `null` dans `page.tsx` aussi.
 */
export default function DiscussionLoading() {
  return (
    <div className="flex flex-col gap-[18px]">
      <DiscussionPostSkeleton />
      <RepliesSkeleton />
    </div>
  );
}
