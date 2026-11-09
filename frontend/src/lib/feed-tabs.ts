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
 * Traduit un onglet en fragment de requête, fusionné par `fetchDiscussions`.
 *
 * `userId` n'est lu que par « Pour vous » : les trois autres onglets restent
 * identiques pour un visiteur et pour un membre. Un visiteur n'atteint jamais
 * « Pour vous » — `FeedSection` le redirige avant d'appeler ici —, donc la
 * branche sans `userId` ne sert que de filet : mieux vaut le tri par défaut
 * qu'un filtre sur un identifiant absent.
 */
const sortAndFiltersForTab = (
  tab: FeedTabKey,
  userId?: number,
): Pick<StrapiQuery, "sort" | "filters"> => {
  switch (tab) {
    /* Les fils où le membre est déjà intervenu. Une seule requête : Strapi
       traverse la relation `replies` puis son auteur. */
    case "pour-vous":
      return userId
        ? {
            sort: ["createdAt:desc"],
            filters: { replies: { author: { id: { $eq: userId } } } },
          }
        : { sort: ["createdAt:desc"] };

    /* `createdAt` départage : beaucoup de discussions ont zéro ou une réponse,
       et Postgres ne garantit aucun ordre entre ex æquo. */
    case "tendances":
      return { sort: ["replyCount:desc", "createdAt:desc"] };

    case "recentes":
      return { sort: ["createdAt:desc"] };

    /* `replyCount` est à `null` tant qu'aucune réponse n'a été écrite — le
       compteur n'est posé qu'au premier incrément. `$eq: 0` seul raterait ces
       discussions-là, qui sont précisément les plus anciennes sans réponse. */
    case "sans-reponse":
      return {
        sort: ["createdAt:desc"],
        filters: { replyCount: { $eq: 0 } },
      };
  }
};

/**
 * Le fragment de requête d'un onglet, restreint à un espace quand il y en a un.
 *
 * Le filtre d'espace se *fusionne* avec celui de l'onglet, il ne le remplace
 * pas : « Sans réponse » occupe déjà `filters`, et l'écraser rendrait l'onglet
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
