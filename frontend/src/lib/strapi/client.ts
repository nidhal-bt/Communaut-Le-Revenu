import type { StrapiErrorBody, StrapiQuery } from "@/types/strapi";
import { STRAPI_API_URL } from "./config";
import { buildQueryString } from "./query";

/** `details` reste `unknown` : les contrôleurs `create` y nichent `details.errors`. */
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

/**
 * Exporté pour `auth.ts`, qui lance son `fetch` lui-même : la connexion a besoin
 * des en-têtes de réponse, que `strapiFetch` ne rend pas.
 */
export const toStrapiError = async (
  response: Response,
): Promise<StrapiError> => {
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
 * Le type de retour est une assertion, pas une validation : rien ne vérifie la
 * réponse à l'exécution.
 *
 * Aucun `cache` par défaut, à dessein : sous `cacheComponents` le cache est
 * opt-in, donc un `fetch` nu n'est déjà pas mis en cache, et un `no-store` codé
 * en dur entrerait en conflit avec un appelant placé dans un `use cache`. Pour
 * mettre en cache, envelopper l'appelant et régler `cacheLife` / `cacheTag`.
 *
 * Conséquence : un appel non mis en cache pendant le rendu doit se trouver sous
 * une frontière `<Suspense>`, sinon le build signale la route comme bloquante.
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
