import qs from "qs";
import type { StrapiQuery } from "@/types/strapi";

/**
 * `skipNulls` n'écrit rien pour une clé absente, et c'est indispensable : le
 * backend active `strictParams` et refuse avec un 400 tout paramètre inconnu ou
 * mal formé. `encodeValuesOnly` laisse les crochets de Strapi 5 lisibles.
 */
export const buildQueryString = (query?: StrapiQuery): string =>
  qs.stringify(query, {
    encodeValuesOnly: true,
    skipNulls: true,
    addQueryPrefix: true,
  });
