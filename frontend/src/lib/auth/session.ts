import "server-only";

import { cookies } from "next/headers";
import type { User } from "@/types/models";

/**
 * La session vit dans un cookie `httpOnly` posé par nos propres Server Actions,
 * jamais dans le `localStorage` : le jeton reste hors de portée du JavaScript
 * de la page, et le client ne peut ni le lire ni le falsifier.
 *
 * Trois valeurs dans un seul cookie, pour qu'une connexion soit une écriture
 * atomique :
 *
 * - `jwt` — le jeton d'accès Strapi. **Il ne vit que 10 minutes** :
 *   `jwtManagement: 'refresh'` est actif côté backend et
 *   `sessions.accessTokenLifespan` vaut 600 s (vérifié sur la réponse de
 *   `/api/auth/local`). C'est lui qu'il faudra envoyer en `Authorization:
 *   Bearer` dès la première écriture authentifiée.
 * - `refreshToken` — le jeton opaque de rotation, valable 14 jours. Strapi ne
 *   le renvoie que dans le cookie `strapi_up_refresh` (`sessions.httpOnly`),
 *   posé sur *son* origine : le navigateur ne le rejouera pas vers le port
 *   1337 depuis le port 3000, d'où la recopie ici. Rien ne l'utilise encore —
 *   voir `actions.ts`.
 * - `user` — les quatre champs dont l'interface a besoin. Les garder ici évite
 *   un `GET /api/users/me` à chaque rendu et laisse l'interface afficher le
 *   membre connecté même une fois le jeton d'accès expiré. Ce cookie n'autorise
 *   rien : seul Strapi décide, jeton en main.
 */
export const SESSION_COOKIE = "communaute_session";

/** 14 jours : la durée de vie « inactif » du jeton de rafraîchissement Strapi. */
const MAX_AGE = 14 * 24 * 60 * 60;

export type Session = {
  jwt: string;
  refreshToken: string | null;
  user: User;
};

/* base64url plutôt que du JSON brut : un cookie ne transporte ni accolade ni
   guillemet sans échappement, et le pseudo peut porter des accents. */
const encode = (session: Session): string =>
  Buffer.from(JSON.stringify(session), "utf8").toString("base64url");

/**
 * Un cookie tronqué, périmé ou écrit par une version antérieure du format ne
 * doit pas faire tomber le rendu : on le traite comme une absence de session,
 * la prochaine connexion l'écrasera.
 */
const decode = (value: string): Session | null => {
  try {
    const session = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Session;

    if (
      typeof session?.jwt !== "string" ||
      typeof session?.user?.username !== "string"
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

/**
 * Lecture de la session. `cookies()` est une API de requête : sous
 * `cacheComponents`, tout appelant doit vivre sous une frontière `<Suspense>`.
 */
export const readSession = async (): Promise<Session | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE);

  return cookie === undefined ? null : decode(cookie.value);
};

/** Le membre connecté, ou `null` pour un visiteur. */
export const getSessionUser = async (): Promise<User | null> =>
  (await readSession())?.user ?? null;

/**
 * Écriture de la session. Next n'autorise la modification d'un cookie que dans
 * une Server Action ou un Route Handler : appelée pendant un rendu, elle lève.
 */
export const writeSession = async (session: Session): Promise<void> => {
  (await cookies()).set(SESSION_COOKIE, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    /* En développement le site est servi en clair : un cookie `secure` ne
       serait jamais renvoyé. */
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
};

/**
 * Suppression de la session. Même contrainte que `writeSession` : hors d'une
 * Server Action ou d'un Route Handler, Next lève.
 *
 * Aucune option à repasser — le cookie a été posé sur `path: "/"`, que
 * `delete` retrouve seul.
 */
export const clearSession = async (): Promise<void> => {
  (await cookies()).delete(SESSION_COOKIE);
};
