import "server-only";

import { cookies } from "next/headers";
import type { User } from "@/types/models";

/**
 * La session tient dans un seul cookie `httpOnly` : le jeton reste hors de portée
 * du JavaScript de la page, et une connexion est une écriture atomique.
 *
 * **Un cookie ne s'écrit que dans une Server Action ou un Route Handler.** Appelées
 * pendant un rendu, `writeSession` et `clearSession` lèvent — c'est la contrainte
 * qui fait de la connexion une action, et non un `fetch` depuis la modale.
 *
 * Le `jwt` ne vit que **10 minutes** (`sessions.accessTokenLifespan`), d'où la
 * rotation tenue par `authenticated-fetch.ts`. Le `refreshToken`, valable 14 jours,
 * n'est posé par Strapi que sur *son* origine : le navigateur ne le rejouerait pas
 * vers le port 1337 depuis le port 3000, d'où la recopie ici. Le `user` évite un
 * `GET /users/me` par rendu et n'autorise rien — seul Strapi décide, jeton en main.
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
 * Un cookie tronqué, périmé ou écrit par un format antérieur se lit comme une
 * absence de session, jamais comme une erreur : la prochaine connexion l'écrase.
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

/** `cookies()` est une API de requête : tout appelant vit sous une `<Suspense>`. */
export const readSession = async (): Promise<Session | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE);

  return cookie === undefined ? null : decode(cookie.value);
};

export const getSessionUser = async (): Promise<User | null> =>
  (await readSession())?.user ?? null;

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

export const clearSession = async (): Promise<void> => {
  (await cookies()).delete(SESSION_COOKIE);
};
