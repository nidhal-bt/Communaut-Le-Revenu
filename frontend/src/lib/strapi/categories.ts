import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import type { Category, Discussion, Reply } from "@/types/models";
import type { StrapiCollection } from "@/types/strapi";
import { strapiFetch } from "./client";
import { categoryTag } from "./tags";

/**
 * Tous les espaces, triés par nom.
 *
 * Le rôle public a déjà `category.find` (`backend/src/bootstrap/permissions.ts`),
 * aucun jeton n'est donc nécessaire.
 *
 * Mise en cache cinq minutes : la liste ne bouge pour ainsi dire jamais, et le
 * rail gauche la lit à *chaque* route. Sans argument, il n'existe qu'une clé —
 * afficher l'accueil interroge donc Strapi une seule fois, et non une fois pour
 * le rail puis une fois pour le composer.
 *
 * `revalidate` est ce qui rend la mise en cache acceptable ici : backend éteint,
 * la liste vide se répare d'elle-même en cinq minutes au lieu de rester figée.
 * Et en renvoyant `[]` plutôt qu'en levant, un backend éteint ne fait pas
 * tomber la page — le rail s'affiche sans espaces, le select du composer se
 * désactive de lui-même.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: 900 });

  try {
    const { data } = await strapiFetch<StrapiCollection<Category>>(
      "/categories",
      { query: { sort: ["name:asc"] } },
    );

    return data;
  } catch {
    return [];
  }
};

/**
 * Un espace depuis son slug, ou `null` s'il n'existe pas.
 *
 * Filtré par slug plutôt que lu sur `/categories/:documentId` : c'est le slug
 * que porte l'URL, et le contrôleur de base accepte `filters`.
 *
 * Volontairement sans `try/catch`, contrairement à `fetchCategories` : cette
 * lecture décide d'un 404. Avaler l'erreur ferait passer un backend éteint pour
 * « cet espace n'existe pas ». Et volontairement sans `use cache` : un espace
 * tout juste créé continuerait de répondre 404 le temps du cache.
 *
 * `cache` de React, en revanche, dédoublonne l'appel *dans une même requête* :
 * `generateMetadata` et le corps de la page demandent le même espace, et ne
 * déclenchent qu'une lecture.
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
 * Les décomptes affichés en tête d'un espace.
 *
 * Les deux nombres viennent de `meta.pagination.total` sur une lecture
 * `pageSize: 1` — le backend pose `withCount: true`, l'enveloppe est donc
 * toujours là, et aucune ligne inutile ne circule.
 *
 * Tentant mais faux : tout compter en une requête avec `fields: ['replyCount']`
 * et `pageSize: 100`. `maxLimit` vaut 100 côté backend, le total serait juste
 * aujourd'hui et silencieusement faux passé cent discussions.
 */
export const fetchCategoryStats = async (
  slug: string,
): Promise<CategoryStats> => {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  /* Les deux totaux bougent dès qu'un membre publie dans cet espace : même
     étiquette que son fil, pour que l'en-tête ne reste pas faux une minute. */
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

    return {
      discussions: discussions.meta.pagination.total,
      replies: replies.meta.pagination.total,
    };
  } catch {
    return { discussions: 0, replies: 0 };
  }
};
