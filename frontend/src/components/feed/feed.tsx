"use client";

import { useState } from "react";
import {
  DEFAULT_FEED_VIEW,
  type FeedTabKey,
  type FeedView,
} from "@/lib/feed-tabs";
import type { Discussion } from "@/types/models";
import { FeedList } from "./feed-list";
import { FeedTabs } from "./feed-tabs";
import { FeedViewToggle } from "./feed-view-toggle";

type FeedProps = {
  discussions: Discussion[];
  tab: FeedTabKey;
  category?: string;
};

/**
 * Tient la densité d'affichage pour la barre et la liste à la fois.
 *
 * C'est le seul état de ce sous-arbre : basculer détaillé / compact ne redemande
 * rien au serveur, les discussions sont déjà là. Le choix n'est pas mémorisé —
 * un rechargement repart en vue détaillée.
 *
 * La session n'est lue ni ici ni dans le sélecteur de densité, seulement dans
 * l'onglet membre : le fil entier n'attend donc jamais le cookie.
 */
export const Feed = ({ discussions, tab, category }: FeedProps) => {
  const [view, setView] = useState<FeedView>(DEFAULT_FEED_VIEW);

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between gap-3">
        <FeedTabs category={category} />
        <FeedViewToggle view={view} onViewChange={setView} />
      </div>

      <FeedList discussions={discussions} view={view} tab={tab} />
    </div>
  );
};
