import { fetchCategories } from "@/lib/strapi/categories";
import { CategoryFilter } from "./category-filter";

/**
 * Liste vide — backend éteint — : aucune barre, plutôt qu'un « Tous les espaces »
 * seul qui ne filtrerait rien.
 */
export const CategoryFilterSection = async () => {
  const categories = await fetchCategories();

  if (categories.length === 0) return null;

  return <CategoryFilter categories={categories} />;
};
