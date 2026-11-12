"use client";

import { useState } from "react";
import {
  DEFAULT_FEED_VIEW,
  type FeedTabKey,
  type FeedView,
} from "@/lib/feed-tabs";
import type { Discussion } from "@/types/models";
import { FeedList } from "./feed-list";
import { FeedPagination } from "./feed-pagination";
import { FeedTabs } from "./feed-tabs";
import { FeedViewToggle } from "./feed-view-toggle";

type FeedProps = {
  discussions: Discussion[];
  pageCount: number;
  tab: FeedTabKey;
  category?: string;
};

/**
 * Le seul état de ce sous-arbre : basculer détaillé / compact ne redemande rien au
 * serveur, et le choix n'est pas mémorisé. La session n'est lue que dans l'onglet
 * membre, donc le fil entier n'attend jamais le cookie.
 */
export const Feed = ({
  discussions,
  pageCount,
  tab,
  category,
}: FeedProps) => {
  const [view, setView] = useState<FeedView>(DEFAULT_FEED_VIEW);

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between gap-3">
        <FeedTabs category={category} />
        <FeedViewToggle view={view} onViewChange={setView} />
      </div>

      <FeedList discussions={discussions} view={view} tab={tab} />

      <FeedPagination pageCount={pageCount} />
    </div>
  );
};
