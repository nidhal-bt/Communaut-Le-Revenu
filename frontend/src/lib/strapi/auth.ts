import "server-only";

import type { User } from "@/types/models";
import { toStrapiError } from "./client";
import { STRAPI_API_URL } from "./config";

/**
 * Ces trois appels ne passent pas par `strapiFetch` : il faut lire les en-têtes
 * de la réponse, que `strapiFetch` ne rend pas. Le backend tourne en
 * `jwtManagement: 'refresh'` avec `sessions.httpOnly`, donc le corps ne contient
 * que `{ jwt, user }` — le jeton de rotation n'arrive que par `Set-Cookie`.
 */

const REFRESH_COOKIE = "strapi_up_refresh";

export type LoginResponse = {
  jwt: string;
  refreshToken: string | null;
  user: User;
};

/**
 * Strapi pose deux cookies — la valeur et sa signature Koa `.sig` — d'où la
 * comparaison exacte sur le nom. `getSetCookie()` est indispensable :
 * `get("set-cookie")` concatène les deux en une seule chaîne.
 */
const readRefreshToken = (response: Response): string | null => {
  for (const header of response.headers.getSetCookie()) {
    const separator = header.indexOf("=");
    const name = header.slice(0, separator).trim();

    if (name === REFRESH_COOKIE) {
      const value = header.slice(separator + 1).split(";")[0];
      return decodeURIComponent(value);
    }
  }

  return null;
};

export const login = async (
  identifier: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await fetch(`${STRAPI_API_URL}/auth/local`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    throw await toStrapiError(response);
  }

  const { jwt, user } = (await response.json()) as { jwt: string; user: User };

  /* La réponse porte aussi `provider`, `confirmed`, `blocked` et les dates, qui
     n'ont rien à faire dans un cookie envoyé à chaque requête. */
  return {
    jwt,
    refreshToken: readRefreshToken(response),
    user: {
      id: user.id,
      documentId: user.documentId,
      username: user.username,
      email: user.email,
    },
  };
};

export type RefreshResponse = {
  jwt: string;
  /** Le *nouveau* jeton de rotation, ou `null` si Strapi n'en a pas posé. */
  refreshToken: string | null;
};

/**
 * Le jeton part dans le **corps**, pas dans un en-tête `Cookie` : le plugin lit
 * d'abord son cookie puis retombe sur `body.refreshToken`, et depuis Node il
 * n'existe aucun bocal à cookies.
 *
 * Le jeton de rotation est renvoyé **tel qu'il est revenu**, `null` compris, et
 * jamais celui qui vient d'être envoyé : la rotation l'invalide sur-le-champ, donc
 * le conserver laisserait une session incapable de se rafraîchir une seconde fois.
 */
export const refresh = async (
  refreshToken: string,
): Promise<RefreshResponse> => {
  const response = await fetch(`${STRAPI_API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw await toStrapiError(response);
  }

  const { jwt } = (await response.json()) as { jwt: string };

  return { jwt, refreshToken: readRefreshToken(response) };
};

/**
 * Le jeton de rotation, dans le corps, désigne *laquelle* des sessions du membre
 * tombe — depuis Node il n'y a pas de cookie pour le porter.
 *
 * La route n'existe que sous `jwtManagement: 'refresh'`, le mode configuré dans
 * `backend/config/plugins.ts` — ailleurs le contrôleur répond 404.
 */
export const logout = async (
  jwt: string,
  refreshToken: string | null,
): Promise<void> => {
  const response = await fetch(`${STRAPI_API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(refreshToken === null ? {} : { refreshToken }),
  });

  if (!response.ok) {
    throw await toStrapiError(response);
  }
};
