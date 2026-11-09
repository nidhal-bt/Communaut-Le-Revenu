/**
 * Les recettes de classes de la page d'une discussion.
 *
 * Dans un module à part, et non exportées par `discussion-post.tsx` comme le
 * fait `feed-list.tsx` pour `FEED_SHELL` : le formulaire de réponse et la carte
 * de connexion sont des composants client, et importer une chaîne depuis
 * `discussion-post.tsx` tirerait `SpaceTile`, `Prose` et leurs dépendances dans
 * leur bundle.
 */

/** La `.post` de la maquette, partagée par la discussion et ses réponses. */
export const POST_SHELL = "rounded-lg border bg-card p-[20px_22px] shadow-card";

/** La `.section-title` de la maquette. */
export const SECTION_TITLE =
  "font-heading text-[21px] font-bold tracking-[-0.01em]";
