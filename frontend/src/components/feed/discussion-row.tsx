import Link from "next/link";
import { SpaceTile } from "@/components/space-tile";
import { formatRelativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import type { Discussion } from "@/types/models";

/** Gabarit partagé avec l'en-tête : les colonnes ne peuvent pas se désaligner. */
export const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_70px_64px] items-center gap-2.5 px-[18px]";

export const DiscussionRowHeader = () => (
  <div
    aria-hidden
    className={cn(
      ROW_GRID,
      "bg-accent py-2 text-[11.5px] font-semibold text-muted-foreground",
    )}
  >
    <span>Discussion</span>
    <span className="text-right">Réponses</span>
    <span className="text-right">Activité</span>
  </div>
);

/**
 * La `.trow` de la maquette : une discussion par ligne, chiffres en colonnes.
 *
 * La colonne « Vues » de la maquette est écartée — il n'existe aucun compteur
 * de vues dans le modèle de données.
 */
export const DiscussionRow = ({ discussion }: { discussion: Discussion }) => {
  const { documentId, title, type, category, author, updatedAt } = discussion;
  const replyCount = discussion.replyCount ?? 0;

  return (
    <Link
      href={`/discussions/${documentId}`}
      className={cn(
        ROW_GRID,
        "group border-t border-border-divider py-2.5 transition-colors first:border-t-0 hover:bg-accent",
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {category && <SpaceTile category={category} size={28} />}

        <span className="flex min-w-0 flex-col">
          <b className="truncate text-[14.5px] font-semibold group-hover:text-primary-text">
            {title}
          </b>
          <span className="flex min-w-0 items-center gap-1.5">
            <small className="min-w-0 truncate text-xs text-muted-foreground">
              {category?.name}
              {author && ` · ${author.username}`}
            </small>
            {type === "question" && (
              <span className="flex-none rounded-full bg-accent px-1.5 text-[10.5px] font-semibold text-foreground-secondary">
                Question
              </span>
            )}
          </span>
        </span>
      </span>

      <span
        className={cn(
          "text-right text-[13.5px] tabular-nums text-foreground-secondary",
          replyCount === 0 && "font-semibold text-destructive",
        )}
      >
        {replyCount}
      </span>

      <time
        dateTime={updatedAt}
        suppressHydrationWarning
        className="text-right text-[13.5px] tabular-nums text-foreground-secondary"
      >
        {formatRelativeTime(updatedAt)}
      </time>
    </Link>
  );
};
