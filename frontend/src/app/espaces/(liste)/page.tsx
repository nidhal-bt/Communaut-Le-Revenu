import { Suspense } from "react";
import type { Metadata } from "next";
import { SpaceCard } from "@/components/category/space-card";
import { StateCard } from "@/components/state-card";
import { fetchCategories } from "@/lib/strapi/categories";
import {
  SPACES_GRID,
  SpacesGridSkeleton,
  SpacesHeader,
} from "../_components/spaces-grid";

export const metadata: Metadata = {
  title: "Tous les espaces",
  description:
    "Les espaces thématiques de la Communauté Le Revenu, calqués sur les grandes rubriques du site.",
};

const SpacesGrid = async () => {
  const categories = await fetchCategories();

  if (categories.length === 0) {
    return (
      <StateCard
        title="Aucun espace à afficher"
        description="Les espaces ne sont pas disponibles pour le moment."
      />
    );
  }

  return (
    <div className={SPACES_GRID}>
      {categories.map((category) => (
        <SpaceCard key={category.documentId} category={category} />
      ))}
    </div>
  );
};

export default function SpacesPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SpacesHeader />

      <Suspense fallback={<SpacesGridSkeleton />}>
        <SpacesGrid />
      </Suspense>
    </div>
  );
}
