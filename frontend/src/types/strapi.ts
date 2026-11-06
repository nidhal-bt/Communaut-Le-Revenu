/**
 * Enveloppes de l'API REST Strapi 5.
 *
 * Strapi 5 renvoie les champs à plat, à côté de `documentId` : il n'y a pas de
 * niveau `attributes` à modéliser. Voir `backend/CLAUDE.md`.
 */

/** Champs système présents sur chaque document renvoyé par l'API. */
export type StrapiDocument = {
  /** Identifiant numérique interne. Ne pas l'utiliser pour router ni pour référencer. */
  id: number;
  /** L'identifiant canonique en Strapi 5. */
  documentId: string;
  createdAt: string;
  updatedAt: string;
  /**
   * `draftAndPublish` est désactivé sur les trois types de contenu : ce champ
   * est toujours présent mais ne signale aucun cycle de publication.
   */
  publishedAt: string;
};

export type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

/** Réponse d'une lecture de collection. `withCount` est actif : `pagination` est toujours là. */
export type StrapiCollection<T> = {
  data: T[];
  meta: { pagination: StrapiPagination };
};

/** Réponse d'une lecture unitaire : `meta` est un objet vide. */
export type StrapiSingle<T> = {
  data: T;
  meta: Record<string, never>;
};

/**
 * Corps renvoyé sur une erreur. Strapi n'utilise jamais une enveloppe
 * `{ success, data, message }`.
 */
export type StrapiErrorBody = {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Paramètres de requête, sérialisés par `buildQueryString`.
 *
 * Le backend active `strictParams` : une clé inconnue ou une syntaxe invalide
 * renvoie un 400 au lieu d'être ignorée. `locale` et `status` n'existent pas
 * ici (ni i18n, ni draft & publish) et déclencheraient donc une erreur.
 */
export type StrapiQuery = {
  fields?: string[];
  /** Les relations ne sont jamais peuplées par défaut : sans `populate`, elles sont absentes. */
  populate?: string[] | Record<string, unknown>;
  sort?: string[];
  filters?: Record<string, unknown>;
  pagination?: { page?: number; pageSize?: number; withCount?: boolean };
};
