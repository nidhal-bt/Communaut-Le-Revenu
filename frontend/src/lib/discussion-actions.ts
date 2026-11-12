"use server";

import { refresh, updateTag } from "next/cache";
import {
  authenticatedFetch,
  NotAuthenticatedError,
} from "@/lib/auth/authenticated-fetch";
import { StrapiError } from "@/lib/strapi/client";
import { categoryTag, HOME_FEED_TAG, topOfWeekTag } from "@/lib/strapi/tags";
import type { Discussion, DiscussionType } from "@/types/models";
import type { StrapiSingle } from "@/types/strapi";


export type CreateDiscussionResult =
  | { discussion: Discussion }
  | { error: string };

/* Les deux valeurs de l'enum du backend, répétées plutôt qu'importées de
   `discussion-types.ts` : ce module-là porte les icônes de la modale. */
const TYPES: readonly DiscussionType[] = ["question", "discussion"];

/** Les erreurs de champ du contrôleur arrivent déjà en français : on les relaie. */
const fieldError = (details: unknown): string | null => {
  const errors = (details as { errors?: Record<string, unknown> } | null)
    ?.errors;

  if (!errors) return null;

  const message =
    errors.title ?? errors.content ?? errors.type ?? errors.category;

  return typeof message === "string" ? message : null;
};

/** 401 et 403 ne sont pas relayés : les permissions répondent avant le contrôleur, en anglais. */
const messageFor = (error: unknown): string => {
  if (error instanceof NotAuthenticatedError) {
    return "Vous devez être connecté pour publier.";
  }

  if (error instanceof StrapiError) {
    if (error.status === 400) {
      return (
        fieldError(error.details) ?? "La publication n'a pas pu être publiée."
      );
    }

    if (error.status === 401) {
      return "Vous devez être connecté pour publier.";
    }

    if (error.status === 403) {
      return "Vous n'êtes pas autorisé à publier.";
    }

    if (error.status === 429) {
      return "Trop de tentatives. Réessayez dans une minute.";
    }
  }

  return "La publication n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.";
};

export const createDiscussionAction = async (
  formData: FormData,
): Promise<CreateDiscussionResult> => {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const category = String(formData.get("category") ?? "");

  /* La modale porte déjà ces contraintes, mais une action est une route publique :
     elle revalide ce qu'elle reçoit. Les bornes sont celles du contrôleur. */
  if (title.length < 10) {
    return { error: "Le titre doit contenir au moins 10 caractères." };
  }
  if (title.length > 150) {
    return { error: "Le titre ne peut pas dépasser 150 caractères." };
  }
  if (content === "") return { error: "Le contenu est obligatoire." };
  if (!TYPES.includes(type as DiscussionType)) {
    return { error: "Le type de publication est invalide." };
  }
  if (category === "") return { error: "L'espace est obligatoire." };

  try {
    const { data } = await authenticatedFetch<StrapiSingle<Discussion>>(
      "/discussions",
      {
        method: "POST",
        /* `author` et `replyCount` sont posés par le contrôleur. */
        body: { data: { title, content, type, category } },
      },
    );

    /* Les deux seules surfaces où la discussion apparaît : le fil de l'accueil et
       son espace. Sa propre page n'est pas nommée — elle vient de naître, aucune
       lecture mise en cache ne la connaît. */
    updateTag(HOME_FEED_TAG);

    /* La publication est la plus récente de la semaine : elle gagne tous les ex
       aequo du classement de son type. */
    updateTag(topOfWeekTag(type as DiscussionType));

    const slug = data.category?.slug;
    if (slug) updateTag(categoryTag(slug));

    /* Le routeur client, que `updateTag` ne touche pas : sans lui, il rejouerait
       la charge qu'il détient déjà. */
    refresh();

    return { discussion: data };
  } catch (error) {
    return { error: messageFor(error) };
  }
};
