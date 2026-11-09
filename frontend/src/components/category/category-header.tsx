import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import {
  PublishButton,
  PublishButtonSkeleton,
} from "@/components/composer/publish-button";
import {
  CategoryStats,
  CategoryStatsSkeleton,
} from "@/components/category/category-stats";
import { SITE_URL } from "@/components/layout/site-bar";
import { SpaceTile } from "@/components/space-tile";
import { rubriqueFor } from "@/lib/rubriques";
import { fetchCategories } from "@/lib/strapi/categories";
import type { Category } from "@/types/models";

/**
 * La liste complète des espaces, pour le select du composer. Lecture mise en
 * cache et sans argument : elle partage son entrée avec le rail gauche, qui l'a
 * déjà demandée.
 */
const ComposeHere = async ({ category }: { category: Category }) => {
  const categories = await fetchCategories();

  return (
    <PublishButton
      label="Publier ici"
      className="flex-none"
      categories={categories}
      defaultCategory={category.documentId}
    />
  );
};

/**
 * La `.cat-head` de la maquette : l'identité de l'espace, ses décomptes, le
 * renvoi vers la rubrique du site et le bouton de publication.
 *
 * Décomptes et bouton vivent chacun sous leur frontière : ils demandent l'un
 * deux lectures de totaux, l'autre le cookie de session, et ni le titre ni la
 * description n'ont à les attendre.
 */
export const CategoryHeader = ({ category }: { category: Category }) => {
  const rubrique = rubriqueFor(category.slug);

  return (
    <section className="flex flex-wrap items-center gap-[18px] rounded-lg border bg-card p-[22px] shadow-card">
      <SpaceTile category={category} size={56} />

      <div className="min-w-[220px] flex-1">
        <h1 className="font-heading text-[28px] leading-tight font-bold tracking-[-0.01em]">
          {category.name}
        </h1>

        {category.description && (
          <p className="mt-1 max-w-[60ch] text-foreground-secondary">
            {category.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3.5 text-[13px] text-muted-foreground">
          <Suspense fallback={<CategoryStatsSkeleton />}>
            <CategoryStats slug={category.slug} />
          </Suspense>
        </div>

        {/* Comme dans la maquette, tous ces liens mènent à l'accueil du site. */}
        {rubrique && (
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener"
            className="mt-2.5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary-text hover:underline"
          >
            <ExternalLink className="size-3.5 flex-none" />
            Toute la rubrique « {rubrique} » sur lerevenu.com
          </a>
        )}
      </div>

      <Suspense fallback={<PublishButtonSkeleton />}>
        <ComposeHere category={category} />
      </Suspense>
    </section>
  );
};

/** Repli pendant la lecture de l'espace : mêmes blocs, mêmes hauteurs. */
export const CategoryHeaderSkeleton = () => (
  <section
    aria-hidden
    className="flex flex-wrap items-center gap-[18px] rounded-lg border bg-card p-[22px] shadow-card"
  >
    <span className="size-[56px] flex-none rounded-[15px] bg-accent" />
    <div className="flex min-w-[220px] flex-1 flex-col gap-2.5">
      <span className="h-6 w-56 rounded-full bg-accent" />
      <span className="h-3 w-full max-w-sm rounded-full bg-accent" />
      <span className="h-2.5 w-48 rounded-full bg-accent" />
    </div>
    <PublishButtonSkeleton />
  </section>
);
