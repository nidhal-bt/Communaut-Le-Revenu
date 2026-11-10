import { DEFAULT_FEED_TAB, type FeedTabKey } from "@/lib/feed-tabs";

/**
 * Les adresses du fil, fabriquées en un seul endroit.
 *
 * Sans `"use client"`, comme `feed-tabs.ts` : `FeedSection` lit le numéro de
 * page côté serveur, la barre d'onglets et le pager écrivent les liens côté
 * client. Les trois partent donc des mêmes règles.
 */

export const DEFAULT_FEED_PAGE = 1;

/**
 * Le numéro de page porté par l'URL, 1 pour tout le reste.
 *
 * Le filtre est strict exprès : « 1.5 », « -2 », « 0 » et « abc » retombent
 * tous sur la première page, plutôt que d'aller demander à Strapi une
 * pagination qu'il refuserait en 400 — `strictParams` est actif.
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

type FeedTarget = { tab?: FeedTabKey; page?: number };

/**
 * L'adresse du fil pour un onglet, une page, ou les deux — le reste de la
 * requête étant conservé.
 *
 * Changer d'onglet efface la page : le tri n'est pas le même, et la page 7 des
 * « Récentes » n'a aucun rapport avec la page 7 des « Tendances », quand elle
 * existe.
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

  if (target.page !== undefined) {
    write(params, "page", String(target.page), String(DEFAULT_FEED_PAGE));
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
};
