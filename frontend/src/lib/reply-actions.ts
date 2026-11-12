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
  topOfWeekTag,
} from "@/lib/strapi/tags";
import type { Reply } from "@/types/models";
import type { StrapiSingle } from "@/types/strapi";


export type CreateReplyResult = { reply: Reply } | { error: string };

/** Les erreurs de champ du contrôleur arrivent déjà en français : on les relaie. */
const fieldError = (details: unknown): string | null => {
  const errors = (details as { errors?: Record<string, unknown> } | null)
    ?.errors;

  if (!errors) return null;

  const message = errors.content ?? errors.discussion;

  return typeof message === "string" ? message : null;
};

/**
 * 401 et 403 ne sont pas relayés : les permissions répondent avant le contrôleur,
 * et en anglais. Un visiteur anonyme reçoit un 403 — `global::is-authenticated`
 * refuse — et un jeton mort un 401.
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

  /* Une action est une route publique : elle revalide ce qu'elle reçoit. */
  if (content === "") return { error: "La réponse ne peut pas être vide." };
  if (discussion === "") return { error: "La discussion est introuvable." };

  try {
    const { data } = await authenticatedFetch<StrapiSingle<Reply>>("/replies", {
      method: "POST",
      body: { data: { content, discussion } },
    });

    /* `updateTag` et non `revalidateTag` : l'API « lire ce que l'on vient
       d'écrire », réservée aux Server Actions, qui périme sans fenêtre. Toutes ces
       surfaces bougent ensemble — le cycle de vie de `reply` vient d'incrémenter
       `replyCount` en SQL. */
    updateTag(discussionTag(discussion));
    updateTag(repliesTag(discussion));
    updateTag(HOME_FEED_TAG);

    /* Le contrôleur peuple `discussion.category` pour cette seule ligne. Sans lui,
       l'espace se répare en une minute plutôt que de faire échouer la publication. */
    const slug = data.discussion?.category?.slug;
    if (slug) updateTag(categoryTag(slug));

    /* La réponse ne change que le classement du type de sa discussion parente. */
    const parentType = data.discussion?.type;
    if (parentType) updateTag(topOfWeekTag(parentType));

    /* Le routeur client, que `updateTag` ne touche pas : sans lui, il rejouerait
       la charge qu'il détient déjà. */
    refresh();

    return { reply: data };
  } catch (error) {
    return { error: messageFor(error) };
  }
};
