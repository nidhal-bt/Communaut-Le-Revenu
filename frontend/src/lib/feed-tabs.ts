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
 * Sans `"use client"` : la barre d'onglets lit ce module pour s'afficher, la page
 * pour construire sa requête. Les deux partent donc de la même liste.
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

export const isMemberFeedTab = (key: FeedTabKey): boolean =>
  FEED_TABS.some((tab) => tab.key === key && tab.memberOnly);

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
 * `userId` n'est lu que par « Pour vous ». Un visiteur n'y arrive jamais —
 * `FeedSection` le redirige avant —, donc la branche sans `userId` n'est qu'un
 * filet : mieux vaut le tri par défaut qu'un filtre sur un identifiant absent.
 */
const sortAndFiltersForTab = (
  tab: FeedTabKey,
  userId?: number,
): Pick<StrapiQuery, "sort" | "filters"> => {
  switch (tab) {
    /* Une seule requête : Strapi traverse la relation `replies` puis son auteur. */
    case "pour-vous":
      return userId
        ? {
            sort: ["createdAt:desc"],
            filters: { replies: { author: { id: { $eq: userId } } } },
          }
        : { sort: ["createdAt:desc"] };

    /* Postgres ne garantit aucun ordre entre ex aequo, et beaucoup de
       discussions ont zéro ou une réponse. */
    case "tendances":
      return { sort: ["replyCount:desc", "createdAt:desc"] };

    case "recentes":
      return { sort: ["createdAt:desc"] };

    /* `replyCount` est à `null` tant qu'aucune réponse n'a été écrite : `$eq: 0`
       seul raterait les discussions les plus anciennes sans réponse. */
    case "sans-reponse":
      return {
        sort: ["createdAt:desc"],
        filters: { replyCount: { $eq: 0 } },
      };
  }
};

/**
 * Le filtre d'espace se *fusionne* avec celui de l'onglet, il ne le remplace pas :
 * « Sans réponse » occupe déjà `filters`, et l'écraser rendrait l'onglet
 * silencieusement inopérant dans un espace.
 */
export const queryForFeedTab = (
  tab: FeedTabKey,
  userId?: number,
  categorySlug?: string,
): Pick<StrapiQuery, "sort" | "filters"> => {
  const base = sortAndFiltersForTab(tab, userId);

  if (!categorySlug) return base;

  return {
    ...base,
    filters: { ...base.filters, category: { slug: { $eq: categorySlug } } },
  };
};
