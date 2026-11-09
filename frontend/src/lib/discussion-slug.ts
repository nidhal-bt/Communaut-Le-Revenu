import type { Discussion } from "@/types/models";

/**
 * L'adresse d'une discussion : le titre en toutes lettres, puis son
 * `documentId`.
 *
 * Le backend ne porte pas de `slug` sur `discussion` : la partie lisible est
 * dérivée du titre ici, et seule la fin de l'adresse identifie le document.
 *
 * Découper sur le *dernier* tiret est exact, et non heuristique : Strapi 5
 * fabrique le `documentId` avec cuid2, dont l'alphabet est `[a-z0-9]` — il ne
 * contient donc jamais de tiret. Et `slugifyTitle` garantit que la partie titre
 * n'en porte jamais en dernier caractère.
 */

const MAX_SLUG_LENGTH = 72;

/** Coupe au dernier tiret, pour ne pas trancher un mot ni laisser un tiret final. */
const cap = (slug: string): string => {
  if (slug.length <= MAX_SLUG_LENGTH) return slug;

  const cut = slug.slice(0, MAX_SLUG_LENGTH);
  const lastHyphen = cut.lastIndexOf("-");

  return lastHyphen === -1 ? cut : cut.slice(0, lastHyphen);
};

export const slugifyTitle = (title: string): string =>
  cap(
    title
      /* NFD sépare la lettre de son accent, le filtre retire les diacritiques :
         « déclarer » donne « declarer », « impôts » donne « impots ». */
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      /* Les apostrophes disparaissent plutôt que de devenir un tiret :
         « d'un » donne « dun », et non « d-un ». */
      .replace(/['’ʼ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );

export const discussionHref = (
  discussion: Pick<Discussion, "documentId" | "title">,
): string => {
  const slug = slugifyTitle(discussion.title);

  /* Un titre fait uniquement de ponctuation passe le `minLength: 10` du schéma
     et ne laisse rien à slugifier : l'adresse ne porte alors que l'identifiant,
     plutôt que de commencer par un tiret. */
  return slug === ""
    ? `/discussions/${discussion.documentId}`
    : `/discussions/${slug}-${discussion.documentId}`;
};

/**
 * Le `documentId` extrait du paramètre d'URL.
 *
 * Sans tiret, `lastIndexOf` renvoie -1 et la tranche part de zéro : un
 * `documentId` nu reste donc une adresse valide. Rien n'est validé ici — un
 * identifiant fantaisiste donne un 404, et le vérifier ne ferait que remplacer
 * ce 404 par un autre.
 */
export const documentIdFromSlug = (slug: string): string =>
  slug.slice(slug.lastIndexOf("-") + 1);
