import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import type { Category, Discussion, Reply } from "@/types/models";
import type { StrapiCollection } from "@/types/strapi";
import { strapiFetch } from "./client";
import { categoryTag } from "./tags";

/**
 * Sans argument, il n'existe qu'une clé : l'accueil n'interroge Strapi qu'une fois,
 * pour le rail comme pour le composer. `cacheLife` par branche, pour ne pas figer
 * `[]` le temps du profil long.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  "use cache";

  try {
    const { data } = await strapiFetch<StrapiCollection<Category>>(
      "/categories",
      { query: { sort: ["name:asc"] } },
    );

    cacheLife({ stale: 300, revalidate: 300, expire: 900 });

    return data;
  } catch {
    cacheLife("seconds");

    return [];
  }
};

/**
 * Volontairement sans `try/catch` ni `use cache`, contrairement à
 * `fetchCategories` : cette lecture décide d'un 404. Avaler l'erreur ferait passer
 * un backend éteint pour « cet espace n'existe pas », et un espace tout juste créé
 * répondrait 404 le temps du cache.
 */
export const fetchCategory = cache(
  async (slug: string): Promise<Category | null> => {
    const { data } = await strapiFetch<StrapiCollection<Category>>(
      "/categories",
      { query: { filters: { slug: { $eq: slug } }, pagination: { pageSize: 1 } } },
    );

    return data[0] ?? null;
  },
);

export type CategoryStats = { discussions: number; replies: number };

/**
 * Tentant mais faux : tout compter en une requête avec `pageSize: 100`. `maxLimit`
 * vaut 100 côté backend — le total serait silencieusement faux passé cent
 * discussions. D'où `meta.pagination.total` sur une lecture `pageSize: 1`.
 */
export const fetchCategoryStats = async (
  slug: string,
): Promise<CategoryStats> => {
  "use cache";
  /* Les deux totaux bougent dès qu'un membre publie ici : même étiquette que son fil. */
  cacheTag(categoryTag(slug));

  try {
    const [discussions, replies] = await Promise.all([
      strapiFetch<StrapiCollection<Discussion>>("/discussions", {
        query: {
          filters: { category: { slug: { $eq: slug } } },
          pagination: { pageSize: 1 },
        },
      }),
      strapiFetch<StrapiCollection<Reply>>("/replies", {
        query: {
          filters: { discussion: { category: { slug: { $eq: slug } } } },
          pagination: { pageSize: 1 },
        },
      }),
    ]);

    cacheLife({ stale: 30, revalidate: 60, expire: 300 });

    return {
      discussions: discussions.meta.pagination.total,
      replies: replies.meta.pagination.total,
    };
  } catch {
    cacheLife("seconds");

    return { discussions: 0, replies: 0 };
  }
};
