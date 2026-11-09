/**
 * Les étiquettes de cache partagées par les lectures et les Server Actions.
 *
 * Module à part pour que l'action de réponse nomme les mêmes étiquettes sans
 * importer un module de lecture — et donc sans tirer ses portées `use cache`
 * dans son propre graphe.
 */

/** Porté par toute lecture dont un décompte de réponses peut bouger. */
export const DISCUSSIONS_TAG = "discussions";

export const discussionTag = (documentId: string): string =>
  `discussion:${documentId}`;

export const repliesTag = (discussionDocumentId: string): string =>
  `replies:${discussionDocumentId}`;
