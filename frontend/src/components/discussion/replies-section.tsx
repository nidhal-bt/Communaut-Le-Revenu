import { SkeletonBar } from "@/components/layout/right-rail/skeleton-bar";
import { cn } from "@/lib/utils";
import type { Reply } from "@/types/models";
import { POST_SHELL, SECTION_TITLE } from "./post-shell";
import { ReplyArea, ReplyBoxSkeleton } from "./reply-box";
import { ReplyItem } from "./reply-item";

const ROWS = [0, 1];

const headingFor = (total: number): string =>
  total === 0
    ? "Aucune réponse pour l'instant"
    : `${total} ${total === 1 ? "réponse" : "réponses"}`;

/**
 * `total` vient de `meta.pagination` et peut dépasser le nombre de réponses lues :
 * au-delà de cent, on le dit plutôt que de laisser croire que le fil est complet.
 */
export const RepliesSection = ({
  replies,
  total,
  discussionDocumentId,
}: {
  replies: Reply[];
  total: number;
  discussionDocumentId: string;
}) => (
  <section aria-label="Réponses" className="flex flex-col gap-3">
    <h2 className={SECTION_TITLE}>{headingFor(total)}</h2>

    {replies.map((reply) => (
      <ReplyItem key={reply.documentId} reply={reply} />
    ))}

    {total > replies.length && (
      <p className="text-[12.5px] text-muted-foreground">
        Les {replies.length} premières réponses sont affichées.
      </p>
    )}

    <ReplyArea discussionDocumentId={discussionDocumentId} />
  </section>
);

export const RepliesSkeleton = () => (
  <div aria-hidden className="flex flex-col gap-3">
    <SkeletonBar className="h-6 w-40" />

    {ROWS.map((row) => (
      <div
        key={row}
        className={cn(POST_SHELL, "flex flex-col gap-2.5 p-[16px_20px]")}
      >
        <div className="flex items-center gap-[11px]">
          <span className="size-[30px] flex-none rounded-full bg-accent" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-2.5 w-16" />
          </div>
        </div>

        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-4/5" />
      </div>
    ))}

    <ReplyBoxSkeleton />
  </div>
);
