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

/** Porté par le fil de l'accueil, tous onglets et tous membres confondus. */
export const HOME_FEED_TAG = "feed:home";

/** Porté par le fil d'un espace et par ses compteurs. */
export const categoryTag = (slug: string): string => `category:${slug}`;

export const discussionTag = (documentId: string): string =>
  `discussion:${documentId}`;

export const repliesTag = (discussionDocumentId: string): string =>
  `replies:${discussionDocumentId}`;
