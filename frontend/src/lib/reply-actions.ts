"use server";

import { refresh, updateTag } from "next/cache";
import {
  authenticatedFetch,
  NotAuthenticatedError,
} from "@/lib/auth/authenticated-fetch";
import { StrapiError } from "@/lib/strapi/client";
import {
  categoryTag,
  discussionTag,
  HOME_FEED_TAG,
  repliesTag,
} from "@/lib/strapi/tags";
import type { Reply } from "@/types/models";
import type { StrapiSingle } from "@/types/strapi";

/**
 * Publier une réponse.
 *
 * Dans son propre module `"use server"`, et non dans `auth/actions.ts` : chaque
 * export d'un tel module est une route HTTP publique, et garder la surface de
 * l'authentification séparée de celle du contenu rend le rayon d'action de
 * chacune lisible.
 */

export type CreateReplyResult = { reply: Reply } | { error: string };

/**
 * Les erreurs de champ du contrôleur arrivent déjà en français
 * (`backend/src/api/reply/controllers/reply.ts`) : on les relaie plutôt que
 * d'en réécrire d'autres.
 */
const fieldError = (details: unknown): string | null => {
  const errors = (details as { errors?: Record<string, unknown> } | null)
    ?.errors;

  if (!errors) return null;

  const message = errors.content ?? errors.discussion;

  return typeof message === "string" ? message : null;
};

/**
 * Le 401 et le 403 ne sont pas relayés : la couche de permissions répond avant
 * le contrôleur, et en anglais. Un visiteur anonyme reçoit un 403 — la
 * politique `global::is-authenticated` refuse — et un jeton mort un 401.
 */
const messageFor = (error: unknown): string => {
  if (error instanceof NotAuthenticatedError) {
    return "Vous devez être connecté pour répondre.";
  }

  if (error instanceof StrapiError) {
    if (error.status === 400) {
      return fieldError(error.details) ?? "La réponse n'a pas pu être publiée.";
    }

    if (error.status === 401) {
      return "Vous devez être connecté pour répondre.";
    }

    if (error.status === 403) {
      return "Vous n'êtes pas autorisé à répondre.";
    }

    if (error.status === 429) {
      return "Trop de tentatives. Réessayez dans une minute.";
    }
  }

  return "La réponse n'a pas pu être publiée. Vérifiez votre connexion et réessayez.";
};

export const createReplyAction = async (
  formData: FormData,
): Promise<CreateReplyResult> => {
  const content = String(formData.get("content") ?? "").trim();
  const discussion = String(formData.get("discussion") ?? "");

  /* Le textarea porte déjà `required`, mais une action est une route
     publique : elle revalide ce qu'elle reçoit. */
  if (content === "") return { error: "La réponse ne peut pas être vide." };
  if (discussion === "") return { error: "La discussion est introuvable." };

  try {
    const { data } = await authenticatedFetch<StrapiSingle<Reply>>("/replies", {
      method: "POST",
      body: { data: { content, discussion } },
    });

    /* `updateTag` et non `revalidateTag` : c'est l'API « lire ce que l'on vient
       d'écrire », réservée aux Server Actions, qui périme sans fenêtre de
       péremption. Toutes ces surfaces bougent par la même publication — le
       cycle de vie de `reply` vient d'incrémenter `replyCount` en SQL, que le
       fil de l'accueil et celui de l'espace affichent tous deux. */
    updateTag(discussionTag(discussion));
    updateTag(repliesTag(discussion));
    updateTag(HOME_FEED_TAG);

    /* Le contrôleur peuple `discussion.category` pour cette seule ligne. Sans
       lui — un backend pas redémarré — l'espace se répare de lui-même en une
       minute plutôt que de faire échouer la publication. */
    const slug = data.discussion?.category?.slug;
    if (slug) updateTag(categoryTag(slug));

    /* Puis le routeur client, que `updateTag` ne touche pas : sans lui, il
       rejouerait la charge qu'il détient déjà. */
    refresh();

    return { reply: data };
  } catch (error) {
    return { error: messageFor(error) };
  }
};
