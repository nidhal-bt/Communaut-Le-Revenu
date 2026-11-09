import qs from "qs";
import type { StrapiQuery } from "@/types/strapi";

/**
 * Sérialise une requête en chaîne prête à concaténer (`""` ou `"?..."`).
 *
 * `qs` écrit la notation crochets de Strapi 5 sans cas particulier par champ :
 * `fields[0]`, `populate[author][fields][0]`, `filters[category][slug][$eq]`.
 *
 * - `encodeValuesOnly` laisse les crochets lisibles et n'encode que les
 *   valeurs, la forme montrée par la documentation Strapi ;
 * - `skipNulls` n'écrit rien pour une clé absente, ce qui est indispensable :
 *   le backend active `strictParams` et refuse avec un 400 tout paramètre
 *   inconnu ou mal formé ;
 * - `addQueryPrefix` pose le `?`, et rend `""` quand il n'y a rien à écrire.
 */
export const buildQueryString = (query?: StrapiQuery): string =>
  qs.stringify(query, {
    encodeValuesOnly: true,
    skipNulls: true,
    addQueryPrefix: true,
  });
