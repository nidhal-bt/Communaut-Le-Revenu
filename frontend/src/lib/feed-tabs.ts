import {
  CircleHelp,
  Clock,
  LayoutList,
  List,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { StrapiQuery } from "@/types/strapi";

/**
 * Les onglets du fil et leur traduction en requête Strapi.
 *
 * Le module est volontairement sans `"use client"` : la barre d'onglets le lit
 * pour s'afficher, la page le lit pour construire sa requête. Les deux partent
 * donc de la même liste et ne peuvent pas divulguer.
 */

export type FeedTabKey =
  | "pour-vous"
  | "tendances"
  | "recentes"
  | "sans-reponse";

export type FeedTab = {
  key: FeedTabKey;
  label: string;
  icon: LucideIcon;
  /** « Pour vous » suit les centres d'intérêt du membre : rien à montrer à un visiteur. */
  memberOnly: boolean;
};

export const FEED_TABS: readonly FeedTab[] = [
  { key: "pour-vous", label: "Pour vous", icon: Sparkles, memberOnly: true },
  { key: "tendances", label: "Tendances", icon: TrendingUp, memberOnly: false },
  { key: "recentes", label: "Récentes", icon: Clock, memberOnly: false },
  {
    key: "sans-reponse",
    label: "Sans réponse",
    icon: CircleHelp,
    memberOnly: false,
  },
];

export const DEFAULT_FEED_TAB: FeedTabKey = "tendances";

export const resolveFeedTab = (value: string | undefined): FeedTabKey => {
  const tab = FEED_TABS.find((candidate) => candidate.key === value);

  return tab ? tab.key : DEFAULT_FEED_TAB;
};

export type FeedView = "comfy" | "compact";

export type FeedViewOption = {
  key: FeedView;
  label: string;
  icon: LucideIcon;
};

export const FEED_VIEWS: readonly FeedViewOption[] = [
  { key: "comfy", label: "Vue détaillée", icon: LayoutList },
  { key: "compact", label: "Vue compacte", icon: List },
];

export const DEFAULT_FEED_VIEW: FeedView = "comfy";

/**
 * Traduit un onglet en fragment de requête, fusionné par `fetchDiscussions`.
 *
 * Les tris et filtres propres à chaque onglet restent à écrire : « Tendances »
 * trierait sur `replyCount`, « Sans réponse » filtrerait sur `replyCount: 0`.
 * En attendant, tous les onglets partagent la même requête — et c'est ici, et
 * nulle part ailleurs, qu'ils se sépareront.
 */
export const queryForFeedTab = (
  tab: FeedTabKey,
): Pick<StrapiQuery, "sort" | "filters"> => {
  switch (tab) {
    case "pour-vous":
    case "tendances":
    case "recentes":
    case "sans-reponse":
      return { sort: ["createdAt:desc"] };
  }
};
