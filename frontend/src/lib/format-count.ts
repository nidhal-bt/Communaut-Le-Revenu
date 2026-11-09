const FORMATTER = new Intl.NumberFormat("fr-FR");

/** Un décompte, séparateur de milliers français : `1702` → `1 702`. */
export const formatCount = (count: number): string => FORMATTER.format(count);
