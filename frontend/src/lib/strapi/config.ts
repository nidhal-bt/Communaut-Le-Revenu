/**
 * Origine du backend Strapi, sans le suffixe `/api`.
 *
 * `STRAPI_INTERNAL_URL` n'est lu que côté serveur : en conteneur, Next joint
 * Strapi par son nom de service (`http://backend:1337`), alors que le
 * navigateur passe toujours par `NEXT_PUBLIC_STRAPI_URL`, figé au build.
 *
 * Une variable vide compte comme absente — d'où le `||` : hors Docker,
 * `STRAPI_INTERNAL_URL=` reste déclarée dans `.env` sans rien écraser.
 *
 * La valeur de repli couvre le développement local : une variable manquante ne
 * fait donc pas échouer le démarrage. Voir `.env.example`.
 */
export const STRAPI_URL =
  process.env.STRAPI_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

/** Racine de l'API REST : c'est ce que `strapiFetch` préfixe aux chemins. */
export const STRAPI_API_URL = `${STRAPI_URL}/api`;
