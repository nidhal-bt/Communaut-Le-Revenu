import type { StrapiErrorBody, StrapiQuery } from "@/types/strapi";
import { STRAPI_API_URL } from "./config";
import { buildQueryString } from "./query";

/**
 * Erreur portant le corps `{ data: null, error: {...} }` de Strapi.
 *
 * `details` reste en `unknown` à dessein : les contrôleurs `create` y nichent
 * leurs erreurs de champ sous `details.errors`, et le typer ici reviendrait à
 * prétendre connaître la forme de toutes les erreurs.
 */
export class StrapiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "StrapiError";
    this.status = status;
    this.details = details;
  }
}

export type StrapiFetchOptions = {
  query?: StrapiQuery;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  signal?: AbortSignal;
};

/** Lit le corps d'erreur Strapi ; retombe sur le statut HTTP si ce n'est pas du JSON. */
const toStrapiError = async (response: Response): Promise<StrapiError> => {
  const body = (await response
    .json()
    .catch(() => null)) as StrapiErrorBody | null;

  if (body?.error) {
    return new StrapiError(
      body.error.message,
      body.error.status,
      body.error.details,
    );
  }

  return new StrapiError(
    `${response.status} ${response.statusText}`,
    response.status,
  );
};

/**
 * Appelle l'API REST Strapi et renvoie l'enveloppe désérialisée.
 *
 * ```ts
 * const page = await strapiFetch<StrapiCollection<Discussion>>("/discussions", {
 *   query: { populate: ["author", "category"], sort: ["createdAt:desc"] },
 * });
 * ```
 *
 * Le type de retour est une assertion, pas une validation : rien ne vérifie la
 * réponse à l'exécution.
 *
 * **Mise en cache.** `cacheComponents` est actif, et dans ce modèle le cache est
 * explicitement opt-in : un `fetch` nu n'est pas mis en cache. On ne force donc
 * aucun `cache` par défaut ici — ce serait redondant, et un `no-store` codé en
 * dur entrerait en conflit avec un appelant placé dans un `use cache` (Next
 * ignore alors les deux options et prévient en développement). Pour mettre en
 * cache, l'idiome est d'envelopper l'appelant dans `use cache` et de régler
 * `cacheLife` / `cacheTag`. Les options `cache` et `next` restent exposées pour
 * un réglage ponctuel.
 *
 * **Conséquence côté rendu :** un appel non mis en cache pendant le rendu doit
 * se trouver sous une frontière `<Suspense>`, sinon le build signale la route
 * comme bloquante. Voir `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.
 *
 * `credentials: "include"` est inutile pour les lectures publiques d'aujourd'hui
 * mais c'est ce qu'exigera le cookie de rafraîchissement httpOnly, d'après
 * `backend/CLAUDE.md`.
 */
export const strapiFetch = async <T>(
  path: string,
  options: StrapiFetchOptions = {},
): Promise<T> => {
  const url = `${STRAPI_API_URL}${path}${buildQueryString(options.query)}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: options.cache,
    next: options.next,
    signal: options.signal,
  });

  if (!response.ok) {
    throw await toStrapiError(response);
  }

  return (await response.json()) as T;
};
