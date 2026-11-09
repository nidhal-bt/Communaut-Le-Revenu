import { Suspense } from "react";
import Link from "next/link";
import {
  CategoryStats,
  CategoryStatsSkeleton,
} from "@/components/category/category-stats";
import { SpaceTile } from "@/components/space-tile";
import type { Category } from "@/types/models";

/** La `.space` de la maquette : une carte par espace dans la grille. */
export const SpaceCard = ({ category }: { category: Category }) => (
  <Link
    href={`/espaces/${category.slug}`}
    className="flex flex-col gap-1.5 rounded-lg border bg-card p-[18px] shadow-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lift"
  >
    <SpaceTile category={category} size={40} className="mb-1.5" />

    <h3 className="font-heading text-[18px] leading-tight tracking-[-0.01em]">
      {category.name}
    </h3>

    {category.description && (
      <p className="flex-1 text-[13.5px] text-foreground-secondary">
        {category.description}
      </p>
    )}

    <small className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
      <Suspense fallback={<CategoryStatsSkeleton />}>
        <CategoryStats slug={category.slug} />
      </Suspense>
    </small>
  </Link>
);
