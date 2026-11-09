import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { SpaceTile } from "@/components/space-tile";
import { discussionHref } from "@/lib/discussion-slug";
import { formatRelativeTime, isWithinHours } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import type { Discussion, PublicAuthor } from "@/types/models";

const ReplyCount = ({ count }: { count: number }) => (
  <span
    className={cn(
      "flex h-[58px] w-[62px] flex-col items-center justify-center rounded-sm border leading-[1.1] text-foreground-secondary",
      count === 0 && "border-dashed border-destructive/40 text-destructive",
    )}
  >
    <b
      className={cn(
        "text-[19px] font-semibold tabular-nums text-foreground",
        count === 0 && "text-destructive",
      )}
    >
      {count}
    </b>
    <span className="text-[10.5px] tracking-[0.02em]">
      {count === 1 ? "réponse" : "réponses"}
    </span>
  </span>
);

const Byline = ({
  author,
  createdAt,
}: {
  author: PublicAuthor | null | undefined;
  createdAt: string;
}) => {
  const when = (
    // Serveur et client ne calculent pas l'écart au même instant ; l'attribut
    // garde la valeur exacte, lisible par la machine.
    <time dateTime={createdAt} suppressHydrationWarning>
      {formatRelativeTime(createdAt)}
    </time>
  );

  if (!author) return <span className="inline-flex items-center">{when}</span>;

  return (
    <span className="inline-flex items-center gap-[7px]">
      <Avatar username={author.username} size="xs" />
      <b className="font-semibold text-foreground-secondary">
        {author.username}
      </b>
      <span>· {when}</span>
    </span>
  );
};

/**
 * La `.tcard` de la maquette : le compteur de réponses en pastille, puis les
 * méta, le titre et le chapô.
 *
 * La maquette montre aussi les « utiles », les vues et les avatars des
 * répondants : aucun de ces champs n'existe côté backend, ils sont donc
 * simplement absents plutôt qu'inventés.
 */
export const DiscussionCard = ({ discussion }: { discussion: Discussion }) => {
  const { title, content, type, category, author, createdAt } = discussion;
  const replyCount = discussion.replyCount ?? 0;
  const isNew = replyCount === 0 && isWithinHours(createdAt, 6);

  return (
    <Link
      href={discussionHref(discussion)}
      className="group grid grid-cols-[minmax(0,1fr)] gap-2 border-t border-border-divider px-4 py-3.5 transition-colors first:border-t-0 hover:bg-accent md:grid-cols-[62px_minmax(0,1fr)] md:gap-4 md:px-[18px] md:py-4"
    >
      <div className="hidden md:block">
        <ReplyCount count={replyCount} />
      </div>

      <div className="min-w-0">
        <div className="mb-[5px] flex flex-wrap items-center gap-2 text-[12.5px]">
          {category && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary-text">
              <SpaceTile category={category} size={18} />
              {category.name}
            </span>
          )}

          {type === "question" && (
            <span className="rounded-full bg-accent px-2 py-px text-[11.5px] font-semibold text-foreground-secondary">
              Question
            </span>
          )}

          {isNew && (
            <span className="rounded-full bg-primary px-2 py-px text-[11.5px] font-semibold text-primary-foreground">
              Nouveau
            </span>
          )}

          <span className="ml-auto text-[12.5px] text-muted-foreground md:hidden">
            {replyCount} rép.
          </span>
        </div>

        <h3 className="font-heading text-[18.5px] leading-[1.3] font-bold tracking-[-0.01em] group-hover:text-primary-text">
          {title}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-foreground-secondary">
          {content}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
          <Byline author={author} createdAt={createdAt} />
        </div>
      </div>
    </Link>
  );
};
