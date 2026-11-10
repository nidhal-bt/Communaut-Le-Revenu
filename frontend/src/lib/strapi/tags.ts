/**
 * Les étiquettes de cache partagées par les lectures et les Server Actions.
 *
 * Module à part pour que les actions nomment les mêmes étiquettes sans importer
 * un module de lecture — et donc sans tirer ses portées `use cache` dans leur
 * propre graphe.
 *
 * Une étiquette par surface affichée, et non une étiquette pour « du contenu a
 * bougé » : publier dans un espace ne doit rien périmer des autres.
 */

import type { DiscussionType } from "@/types/models";

/** Porté par le fil de l'accueil, tous onglets et tous membres confondus. */
export const HOME_FEED_TAG = "feed:home";

/** Porté par le fil d'un espace et par ses compteurs. */
export const categoryTag = (slug: string): string => `category:${slug}`;

export const discussionTag = (documentId: string): string =>
  `discussion:${documentId}`;

export const repliesTag = (discussionDocumentId: string): string =>
  `replies:${discussionDocumentId}`;

/**
 * Porté par une carte « top de la semaine » du rail droit.
 *
 * Une étiquette par type de publication, comme la lecture a une entrée de cache
 * par type : répondre à une question ne périme alors pas le classement des
 * discussions, et inversement.
 */
export const topOfWeekTag = (type: DiscussionType): string =>
  `top-week:${type}`;
