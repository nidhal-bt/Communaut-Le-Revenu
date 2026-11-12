"use client";

import { FEED_VIEWS, type FeedView } from "@/lib/feed-tabs";
import { cn } from "@/lib/utils";
import { SEGMENT_RAIL, SEGMENT_SELECTED } from "./feed-tabs";

type FeedViewToggleProps = {
  view: FeedView;
  onViewChange: (view: FeedView) => void;
};

/**
 * Volontairement séparé de la barre d'onglets et sans aucune lecture de session ni
 * de l'URL : il s'hydrate donc avec `Feed`, au-dessus de toute frontière. Tant
 * qu'il vivait sous celle de `FeedTabs`, le clic restait inerte le temps que le
 * cookie soit lu.
 */
export const FeedViewToggle = ({ view, onViewChange }: FeedViewToggleProps) => (
  <div
    role="group"
    aria-label="Affichage de la liste"
    className={cn("inline-flex flex-none", SEGMENT_RAIL)}
  >
    {FEED_VIEWS.map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        type="button"
        onClick={() => onViewChange(key)}
        aria-pressed={key === view}
        aria-label={label}
        title={label}
        className={cn(
          "grid h-[30px] w-[34px] place-items-center rounded-sm text-muted-foreground transition-[background-color,box-shadow,color] hover:text-foreground",
          key === view && SEGMENT_SELECTED,
        )}
      >
        <Icon className="size-[17px]" />
      </button>
    ))}
  </div>
);

export const FeedViewToggleSkeleton = () => (
  <span aria-hidden className="h-[36px] w-[74px] flex-none rounded-md bg-accent" />
);
