/**
 * Strapi 5 renvoie les champs à plat, à côté de `documentId` : il n'y a pas de
 * niveau `attributes` à modéliser.
 */

export type StrapiDocument = {
  /** Identifiant numérique interne. Ne pas l'utiliser pour router ni pour référencer. */
  id: number;
  /** L'identifiant canonique en Strapi 5. */
  documentId: string;
  createdAt: string;
  updatedAt: string;
  /** `draftAndPublish` est désactivé : toujours présent, ne signale aucun cycle. */
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

/** Strapi n'utilise jamais une enveloppe `{ success, data, message }`. */
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
 * Le backend active `strictParams` : une clé inconnue ou une syntaxe invalide
 * renvoie un 400 au lieu d'être ignorée. `locale` et `status` n'existent pas ici.
 */
export type StrapiQuery = {
  fields?: string[];
  populate?: string[] | Record<string, unknown>;
  sort?: string[];
  filters?: Record<string, unknown>;
  pagination?: { page?: number; pageSize?: number; withCount?: boolean };
};
