import { fetchCategories } from "@/lib/strapi/categories";
import { QuickComposer } from "./quick-composer";

/**
 * Lit les espaces côté serveur et les passe à la barre, qui est un composant
 * client. Fichier distinct : `quick-composer.tsx` porte `"use client"` et ne
 * peut donc pas héberger un composant serveur asynchrone.
 *
 * Lecture volontairement non mise en cache. Un `use cache` ferait préparer la
 * liste au build : backend éteint, une liste vide serait figée dans le cache.
 * Sous `<Suspense>`, l'échec se limite à une requête et se répare dès que
 * Strapi revient.
 */
export const QuickComposerSection = async () => {
  const categories = await fetchCategories();

  return <QuickComposer categories={categories} />;
};
