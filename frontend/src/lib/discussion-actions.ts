"use server";

import { refresh, updateTag } from "next/cache";
import {
  authenticatedFetch,
  NotAuthenticatedError,
} from "@/lib/auth/authenticated-fetch";
import { StrapiError } from "@/lib/strapi/client";
import { DISCUSSIONS_TAG } from "@/lib/strapi/tags";
import type { Discussion, DiscussionType } from "@/types/models";
import type { StrapiSingle } from "@/types/strapi";

/**
 * Publier une discussion.
 *
 * Dans son propre module `"use server"`, pour la même raison que
 * `reply-actions.ts` : chaque export d'un tel module est une route HTTP
 * publique, et séparer les surfaces garde le rayon d'action de chacune lisible.
 */

export type CreateDiscussionResult =
  | { discussion: Discussion }
  | { error: string };

/* Les deux valeurs de l'enum du backend, répétées ici plutôt qu'importées de
   `discussion-types.ts` : ce module-là porte les icônes de la modale, qu'une
   action n'a aucune raison de tirer dans son graphe. */
const TYPES: readonly DiscussionType[] = ["question", "discussion"];

/**
 * Les erreurs de champ du contrôleur arrivent déjà en français
 * (`backend/src/api/discussion/controllers/discussion.ts`) : on les relaie
 * plutôt que d'en réécrire d'autres.
 */
const fieldError = (details: unknown): string | null => {
  const errors = (details as { errors?: Record<string, unknown> } | null)
    ?.errors;

  if (!errors) return null;

  const message =
    errors.title ?? errors.content ?? errors.type ?? errors.category;

  return typeof message === "string" ? message : null;
};

/**
 * Le 401 et le 403 ne sont pas relayés : la couche de permissions répond avant
 * le contrôleur, et en anglais.
 */
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

  /* La modale porte déjà ces contraintes, mais une action est une route
     publique : elle revalide ce qu'elle reçoit. Les bornes du titre et le
     caractère obligatoire du contenu sont celles du contrôleur. */
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
        /* `author` et `replyCount` sont posés par le contrôleur : les envoyer
           d'ici laisserait croire que le client peut en décider. */
        body: { data: { title, content, type, category } },
      },
    );

    /* Une seule étiquette : la discussion vient de naître, aucune lecture mise
       en cache ne la nomme encore. `DISCUSSIONS_TAG` périme le fil et les
       compteurs de l'espace, qui viennent tous deux de bouger. */
    updateTag(DISCUSSIONS_TAG);
    refresh();

    return { discussion: data };
  } catch (error) {
    return { error: messageFor(error) };
  }
};
