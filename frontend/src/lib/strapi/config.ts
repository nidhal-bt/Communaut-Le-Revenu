/**
 * Origine du backend Strapi, sans le suffixe `/api`.
 *
 * La valeur de repli couvre le développement local : une variable manquante ne
 * fait donc pas échouer le démarrage. Voir `.env.example`.
 */
export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/** Racine de l'API REST : c'est ce que `strapiFetch` préfixe aux chemins. */
export const STRAPI_API_URL = `${STRAPI_URL}/api`;
