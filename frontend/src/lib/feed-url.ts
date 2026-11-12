import { DEFAULT_FEED_TAB, type FeedTabKey } from "@/lib/feed-tabs";

export const DEFAULT_FEED_PAGE = 1;

/**
 * Le filtre est strict exprès : « 1.5 », « -2 », « 0 » et « abc » retombent sur la
 * première page, plutôt que d'aller demander à Strapi une pagination qu'il
 * refuserait en 400 — `strictParams` est actif.
 */
export const resolveFeedPage = (value: string | undefined): number => {
  if (value === undefined || !/^[0-9]+$/.test(value)) return DEFAULT_FEED_PAGE;

  const page = Number(value);

  return page >= 1 ? page : DEFAULT_FEED_PAGE;
};

/** Un paramètre à sa valeur par défaut ne s'écrit pas : l'URL reste nue. */
const write = (
  params: URLSearchParams,
  key: string,
  value: string,
  fallback: string,
) => {
  if (value === fallback) {
    params.delete(key);
    return;
  }

  params.set(key, value);
};

type FeedTarget = { tab?: FeedTabKey; page?: number; category?: string };

/**
 * Changer d'onglet ou d'espace efface la page : la page 7 d'un fil n'a rien à voir
 * avec la page 7 d'un autre. La chaîne vide est « Tous les espaces ».
 */
export const feedHref = (
  pathname: string,
  searchParams: URLSearchParams,
  target: FeedTarget,
): string => {
  const params = new URLSearchParams(searchParams.toString());

  if (target.tab !== undefined) {
    write(params, "tab", target.tab, DEFAULT_FEED_TAB);
    params.delete("page");
  }

  if (target.category !== undefined) {
    write(params, "category", target.category, "");
    params.delete("page");
  }

  if (target.page !== undefined) {
    write(params, "page", String(target.page), String(DEFAULT_FEED_PAGE));
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
};
