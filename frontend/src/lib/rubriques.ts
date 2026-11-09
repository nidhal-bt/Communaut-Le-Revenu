/**
 * L'espace communautaire renvoie vers la rubrique correspondante du site
 * (`RUBRIQUE` dans la maquette). Dix des onze espaces en ont une ; « Le Café du
 * Revenu » n'a pas d'équivalent éditorial, son lien est donc simplement absent.
 *
 * Les libellés, eux, sont ceux du site : ils ne se déduisent pas du nom de
 * l'espace.
 */
const RUBRIQUES: Record<string, string> = {
  bourse: "Réussir en Bourse",
  economie: "Économie",
  epargne: "Diversifier vos placements",
  "assurance-vie": "Diversifier vos placements",
  immobilier: "Investir dans l'immobilier",
  impots: "Réduire vos impôts",
  retraite: "Diversifier vos placements",
  transmission: "Préparer une succession",
  alternatifs: "Diversifier vos placements",
  budget: "Vie pratique",
};

export const rubriqueFor = (slug: string): string | null =>
  RUBRIQUES[slug] ?? null;
