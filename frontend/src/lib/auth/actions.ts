"use server";

import { after } from "next/server";
import { login, logout } from "@/lib/strapi/auth";
import { StrapiError } from "@/lib/strapi/client";
import type { User } from "@/types/models";
import { clearSession, readSession, writeSession } from "./session";

/**
 * Server Actions de l'authentification.
 *
 * Tout passe par ici parce que Next n'autorise l'écriture d'un cookie que dans
 * une Server Action ou un Route Handler. Effet de bord utile : le mot de passe
 * part du navigateur vers notre serveur, pas vers Strapi, et le jeton n'est
 * jamais exposé au JavaScript de la page.
 *
 * La rotation du jeton vit ailleurs : le jeton d'accès ne dure que 10 minutes
 * (voir `session.ts`), et `authenticated-fetch.ts` échange le jeton de rotation
 * dès qu'un appel de membre revient en 401.
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

/**
 * Déconnexion.
 *
 * Notre cookie part **d'abord**, et c'est lui seul qui décide : un backend
 * éteint ou un jeton déjà expiré ne doit pas laisser le membre connecté chez
 * nous.
 *
 * La révocation chez Strapi suit, mais après la réponse (`after`) : elle n'a
 * aucune raison de retenir l'interface, et sans cela un backend injoignable
 * ferait attendre le membre le temps du timeout avant que l'en-tête ne
 * rebascule.
 *
 * Rien n'est renvoyé et rien n'est redirigé : toutes les pages sont publiques,
 * c'est donc à l'appelant de décider où il reste.
 */
export const logoutAction = async (): Promise<void> => {
  const session = await readSession();

  await clearSession();

  if (session === null) return;

  after(async () => {
    try {
      await logout(session.jwt, session.refreshToken);
    } catch {
      /* Au mieux : le cookie est déjà parti, il n'y a plus rien à rattraper ni
         rien à annoncer à un membre déjà déconnecté de notre côté. */
    }
  });
};
