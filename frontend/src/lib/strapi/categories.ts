import type { Category } from "@/types/models";
import type { StrapiCollection } from "@/types/strapi";
import { strapiFetch } from "./client";

/**
 * Les espaces proposés dans le composer, triés par nom.
 *
 * Le rôle public a déjà `category.find` (`backend/src/bootstrap/permissions.ts`),
 * aucun jeton n'est donc nécessaire. En développement le backend est souvent
 * éteint : on renvoie une liste vide plutôt que de faire tomber l'accueil, et
 * le select de la modale se désactive de lui-même.
 */
export const fetchCategories = async (): Promise<Category[]> => {
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
