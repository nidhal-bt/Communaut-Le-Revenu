import { fetchCategories } from "@/lib/strapi/categories";
import { QuickComposer } from "./quick-composer";

/**
 * Fichier distinct : `quick-composer.tsx` porte `"use client"` et ne peut donc pas
 * héberger un composant serveur asynchrone.
 */
export const QuickComposerSection = async () => {
  const categories = await fetchCategories();

  return <QuickComposer categories={categories} />;
};
