import "server-only";

import { refresh, type RefreshResponse } from "@/lib/strapi/auth";
import { toStrapiError } from "@/lib/strapi/client";
import { STRAPI_API_URL } from "@/lib/strapi/config";
import { buildQueryString } from "@/lib/strapi/query";
import type { StrapiQuery } from "@/types/strapi";
import {
  clearSession,
  readSession,
  writeSession,
  type Session,
} from "./session";

/**
 * Le seul chemin pour appeler l'API en tant que membre.
 *
 * Volontairement à côté de `strapiFetch` plutôt que dedans : ce dernier est le
 * client des lectures publiques, et toute sa documentation explique comment
 * mettre ses appelants en cache. Y glisser une écriture inviterait à poser un
 * POST dans une portée `use cache`, ce que Next ne peut pas rattraper. C'est la
 * même raison qui fait que `strapi/auth.ts` lance son `fetch` lui-même.
 *
 * **Jamais dans une portée `use cache` :** `readSession` lit les cookies, donc
 * une API de requête. Aujourd'hui le seul appelant est une Server Action.
 */
export class NotAuthenticatedError extends Error {
  constructor() {
    super("Session absente ou expirée");
    this.name = "NotAuthenticatedError";
  }
}

export type AuthenticatedFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: StrapiQuery;
  signal?: AbortSignal;
};

const send = async (
  path: string,
  options: AuthenticatedFetchOptions,
  jwt: string,
): Promise<Response> =>
  fetch(`${STRAPI_API_URL}${path}${buildQueryString(options.query)}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${jwt}`,
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

/* Une écriture de cookie pendant un rendu lève, et ce n'est pas un échec : le
   jeton rafraîchi reste valable pour *cette* requête. La conséquence assumée,
   déjà notée dans `session.ts` : la requête suivante recommencera. */
const persist = async (session: Session): Promise<void> => {
  try {
    await writeSession(session);
  } catch {
    /* ignoré : voir ci-dessus */
  }
};

const forget = async (): Promise<void> => {
  try {
    await clearSession();
  } catch {
    /* ignoré : voir ci-dessus */
  }
};

const renew = async (session: Session): Promise<Session> => {
  if (session.refreshToken === null) {
    await forget();
    throw new NotAuthenticatedError();
  }

  let rotated: RefreshResponse;

  try {
    rotated = await refresh(session.refreshToken);
  } catch {
    await forget();
    throw new NotAuthenticatedError();
  }

  /* La session entière est réécrite : le jeton de rotation que l'on vient
     d'envoyer est déjà invalide, et n'enregistrer que le `jwt` laisserait une
     session incapable de se rafraîchir à nouveau. */
  const next: Session = {
    jwt: rotated.jwt,
    refreshToken: rotated.refreshToken,
    user: session.user,
  };

  await persist(next);

  return next;
};

export const authenticatedFetch = async <T>(
  path: string,
  options: AuthenticatedFetchOptions = {},
): Promise<T> => {
  const session = await readSession();

  if (session === null) throw new NotAuthenticatedError();

  let response = await send(path, options, session.jwt);

  /* Le jeton d'accès ne vit que 10 minutes : un 401 est le cas normal, pas une
     exception. Un 403 est laissé tel quel — il veut dire « pas autorisé », et
     non « jeton mort ». Le rejeu est une seconde ligne droite plutôt qu'un
     compteur : un 401 sur celle-ci est terminal. */
  if (response.status === 401) {
    const renewed = await renew(session);

    response = await send(path, options, renewed.jwt);

    if (response.status === 401) {
      await forget();
      throw new NotAuthenticatedError();
    }
  }

  if (!response.ok) throw await toStrapiError(response);
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
};
