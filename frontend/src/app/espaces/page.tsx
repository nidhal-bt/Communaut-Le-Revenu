import { Suspense } from "react";
import type { Metadata } from "next";
import { SpaceCard } from "@/components/category/space-card";
import { fetchCategories } from "@/lib/strapi/categories";

export const metadata: Metadata = {
  title: "Tous les espaces",
  description:
    "Les espaces thématiques de la Communauté Le Revenu, calqués sur les grandes rubriques du site.",
};

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5";

const SpacesGrid = async () => {
  const categories = await fetchCategories();

  if (categories.length === 0) {
    return (
      <p className="rounded-lg border bg-card p-[22px] text-sm text-foreground-secondary shadow-card">
        Les espaces ne sont pas disponibles pour le moment.
      </p>
    );
  }

  return (
    <div className={GRID}>
      {categories.map((category) => (
        <SpaceCard key={category.documentId} category={category} />
      ))}
    </div>
  );
};

const SpacesGridSkeleton = () => (
  <div aria-hidden className={GRID}>
    {[0, 1, 2, 3, 4, 5].map((index) => (
      <span
        key={index}
        className="flex flex-col gap-2.5 rounded-lg border bg-card p-[18px] shadow-card"
      >
        <span className="mb-1.5 size-10 rounded-[11px] bg-accent" />
        <span className="h-4 w-40 rounded-full bg-accent" />
        <span className="h-3 w-full rounded-full bg-accent" />
        <span className="h-2.5 w-32 rounded-full bg-accent" />
      </span>
    ))}
  </div>
);

export default function SpacesPage() {
  return (
    <div className="flex flex-col gap-[18px]">
      <header>
        <h1 className="font-heading text-[28px] leading-tight font-bold tracking-[-0.01em]">
          Tous les espaces
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-foreground-secondary">
          Les espaces thématiques de la communauté, calqués sur les grandes
          rubriques du Revenu.
        </p>
      </header>

      <Suspense fallback={<SpacesGridSkeleton />}>
        <SpacesGrid />
      </Suspense>
    </div>
  );
}
