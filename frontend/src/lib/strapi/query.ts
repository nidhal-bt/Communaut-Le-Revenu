import type { StrapiQuery } from "@/types/strapi";

/**
 * Écrit une valeur en notation crochets Strapi 5 : un tableau devient
 * `clé[0]`, `clé[1]`…, un objet `clé[sousClé]`, un scalaire `clé=valeur`.
 *
 * Une seule fonction récursive couvre `fields`, `populate`, `sort`,
 * `pagination` et les `filters` imbriqués (`filters[category][slug][$eq]`),
 * sans cas particulier par champ.
 */
const append = (params: URLSearchParams, key: string, value: unknown): void => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => append(params, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === "object") {
    for (const [childKey, childValue] of Object.entries(value)) {
      append(params, `${key}[${childKey}]`, childValue);
    }
    return;
  }

  params.set(key, String(value));
};

/**
 * Sérialise une requête en chaîne prête à concaténer (`""` ou `"?..."`).
 *
 * Les clés absentes n'écrivent rien, ce qui est indispensable : le backend
 * active `strictParams` et refuse avec un 400 tout paramètre inconnu.
 */
export const buildQueryString = (query?: StrapiQuery): string => {
  if (query === undefined) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    append(params, key, value);
  }

  const serialized = params.toString();
  return serialized === "" ? "" : `?${serialized}`;
};
