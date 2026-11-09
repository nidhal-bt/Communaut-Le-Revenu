"use server";

import { login } from "@/lib/strapi/auth";
import { StrapiError } from "@/lib/strapi/client";
import type { User } from "@/types/models";
import { writeSession } from "./session";

/**
 * Server Actions de l'authentification.
 *
 * Tout passe par ici parce que Next n'autorise l'écriture d'un cookie que dans
 * une Server Action ou un Route Handler. Effet de bord utile : le mot de passe
 * part du navigateur vers notre serveur, pas vers Strapi, et le jeton n'est
 * jamais exposé au JavaScript de la page.
 *
 * **La déconnexion est encore à venir.** La rotation du jeton, elle, est
 * branchée : le jeton d'accès ne vit que 10 minutes (voir `session.ts`), et
 * `authenticated-fetch.ts` échange le jeton de rotation dès qu'un appel de
 * membre revient en 401.
 */

export type LoginResult = { user: User } | { error: string };

/**
 * Message affiché au lecteur. On ne relaie jamais `error.message` : Strapi
 * répond en anglais (« Invalid identifier or password ») et distinguer
 * « compte inconnu » de « mot de passe faux » renseignerait un attaquant.
 */
const messageFor = (error: unknown): string => {
  if (error instanceof StrapiError) {
    if (error.status === 400) {
      return "Adresse e-mail ou mot de passe incorrect.";
    }

    /* Le plugin limite les routes d'authentification à 10 requêtes par minute. */
    if (error.status === 429) {
      return "Trop de tentatives. Réessayez dans une minute.";
    }
  }

  return "La connexion a échoué. Vérifiez votre connexion et réessayez.";
};

export const loginAction = async (formData: FormData): Promise<LoginResult> => {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  /* Le formulaire porte déjà `required`, mais une action est une route
     publique : elle revalide ce qu'elle reçoit. */
  if (identifier === "" || password === "") {
    return { error: "Renseignez votre adresse e-mail et votre mot de passe." };
  }

  try {
    const session = await login(identifier, password);
    await writeSession(session);

    return { user: session.user };
  } catch (error) {
    return { error: messageFor(error) };
  }
};
