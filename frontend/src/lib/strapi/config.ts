/**
 * `STRAPI_INTERNAL_URL` n'est lu que côté serveur : en conteneur, Next joint
 * Strapi par son nom de service, alors que le navigateur passe par
 * `NEXT_PUBLIC_STRAPI_URL`, figé au build.
 *
 * `||` et non `??` : une variable vide compte comme absente, car hors Docker
 * `STRAPI_INTERNAL_URL=` reste déclarée dans `.env` sans rien devoir écraser.
 */
export const STRAPI_URL =
  process.env.STRAPI_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

export const STRAPI_API_URL = `${STRAPI_URL}/api`;
