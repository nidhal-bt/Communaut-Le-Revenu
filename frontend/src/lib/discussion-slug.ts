import type { Discussion } from "@/types/models";

/**
 * L'adresse est le titre slugifié, puis le `documentId` — le backend ne porte pas
 * de `slug` sur `discussion`.
 *
 * Découper sur le *dernier* tiret est exact, et non heuristique : Strapi 5 fabrique
 * le `documentId` avec cuid2, dont l'alphabet `[a-z0-9]` ne contient pas de tiret.
 */

const MAX_SLUG_LENGTH = 72;

const cap = (slug: string): string => {
  if (slug.length <= MAX_SLUG_LENGTH) return slug;

  const cut = slug.slice(0, MAX_SLUG_LENGTH);
  const lastHyphen = cut.lastIndexOf("-");

  return lastHyphen === -1 ? cut : cut.slice(0, lastHyphen);
};

export const slugifyTitle = (title: string): string =>
  cap(
    title
      /* NFD sépare la lettre de son accent, le filtre retire les diacritiques. */
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      /* Les apostrophes disparaissent plutôt que de devenir un tiret : « d'un » donne « dun ». */
      .replace(/['’ʼ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );

export const discussionHref = (
  discussion: Pick<Discussion, "documentId" | "title">,
): string => {
  const slug = slugifyTitle(discussion.title);

  /* Un titre fait uniquement de ponctuation passe le `minLength: 10` du schéma et
     ne laisse rien à slugifier : l'adresse ne porte alors que l'identifiant. */
  return slug === ""
    ? `/discussions/${discussion.documentId}`
    : `/discussions/${slug}-${discussion.documentId}`;
};

/**
 * Sans tiret, `lastIndexOf` renvoie -1 et la tranche part de zéro : un `documentId`
 * nu reste une adresse valide. Rien n'est validé — un identifiant fantaisiste donne
 * un 404, et le vérifier ne ferait que remplacer ce 404 par un autre.
 */
export const documentIdFromSlug = (slug: string): string =>
  slug.slice(slug.lastIndexOf("-") + 1);
