import "server-only";

import type { User } from "@/types/models";
import { toStrapiError } from "./client";
import { STRAPI_API_URL } from "./config";

/**
 * `POST /api/auth/local` — le seul appel d'authentification branché.
 *
 * Il ne passe pas par `strapiFetch` pour deux raisons : c'est un POST sans
 * paramètres de requête, et surtout il faut lire les en-têtes de la réponse,
 * que `strapiFetch` ne rend pas. Le backend tourne en `jwtManagement:
 * 'refresh'` avec `sessions.httpOnly`, donc le corps ne contient que
 * `{ jwt, user }` : le jeton de rotation n'arrive que par `Set-Cookie`.
 *
 * Appelé uniquement depuis une Server Action : le mot de passe ne traverse
 * jamais le navigateur vers Strapi, et l'origine du backend reste privée.
 */

/** Nom du cookie posé par Strapi (`sessions.cookie.name`, non surchargé). */
const REFRESH_COOKIE = "strapi_up_refresh";

export type LoginResponse = {
  jwt: string;
  refreshToken: string | null;
  user: User;
};

/**
 * Récupère la valeur du cookie de rotation dans les en-têtes `Set-Cookie`.
 *
 * Strapi en pose deux — la valeur et sa signature Koa `strapi_up_refresh.sig`
 * — d'où la comparaison exacte sur le nom. `getSetCookie()` est indispensable :
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

  /* On ne garde que les champs utiles à l'interface : la réponse porte aussi
     `provider`, `confirmed`, `blocked` et les dates, qui n'ont rien à faire
     dans un cookie envoyé à chaque requête. */
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
