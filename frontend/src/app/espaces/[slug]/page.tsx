import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoryHeader,
  CategoryHeaderSkeleton,
} from "@/components/category/category-header";
import { FeedSection } from "@/components/feed/feed-section";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { fetchCategory } from "@/lib/strapi/categories";

type SpaceParams = PageProps<"/espaces/[slug]">["params"];

/**
 * Le `try` ne couvre pas un espace absent — `fetchCategory` renvoie `null` pour
 * ça — mais un backend injoignable : `generateMetadata` n'est sous aucune frontière
 * `<Suspense>`, donc sans ce filet, construire l'image frontend imposerait d'avoir
 * déjà l'API debout. Le vrai 404 reste décidé dans le corps de la page.
 */
export const generateMetadata = async ({
  params,
}: PageProps<"/espaces/[slug]">): Promise<Metadata> => {
  const { slug } = await params;

  try {
    const category = await fetchCategory(slug);

    if (!category) return {};

    return {
      title: category.name,
      description: category.description ?? undefined,
    };
  } catch {
    return {};
  }
};

const CategoryHeaderSection = async ({ params }: { params: SpaceParams }) => {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  /* Un slug inconnu rend bien la page de 404, mais sous un statut 200 : la coquille
     est déjà partie quand cette lecture aboutit, et `instant = false` n'y change
     rien (vérifié en production). Soft 404 assumé. */
  if (!category) notFound();

  return <CategoryHeader category={category} />;
};

const SpaceFeed = async ({
  params,
  searchParams,
}: PageProps<"/espaces/[slug]">) => {
  const { slug } = await params;

  return (
    <FeedSection
      pathname={`/espaces/${slug}`}
      searchParams={searchParams}
      categorySlug={slug}
    />
  );
};

/**
 * Ni `params` ni `searchParams` ne sont attendus ici : ce sont des lectures de la
 * requête, et les attendre dans le corps de la page la rendrait bloquante en
 * entier. Chaque moitié vit sous sa frontière et attend sa propre donnée.
 */
export default function SpacePage({
  params,
  searchParams,
}: PageProps<"/espaces/[slug]">) {
  return (
    <div className="flex flex-col gap-[18px]">
      <Suspense fallback={<CategoryHeaderSkeleton />}>
        <CategoryHeaderSection params={params} />
      </Suspense>

      <Suspense fallback={<FeedSkeleton />}>
        <SpaceFeed params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
