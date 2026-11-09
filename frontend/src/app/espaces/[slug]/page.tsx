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
 * `fetchCategory` passe par `cache` de React : cette lecture et celle de
 * l'en-tête n'en font qu'une.
 */
export const generateMetadata = async ({
  params,
}: PageProps<"/espaces/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) return {};

  return {
    title: category.name,
    description: category.description ?? undefined,
  };
};

const CategoryHeaderSection = async ({ params }: { params: SpaceParams }) => {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  /* Un slug inconnu rend bien la page de 404, mais sous un statut 200 : la
     coquille est déjà partie quand cette lecture aboutit, et `instant = false`
     n'y change rien (vérifié en production). Soft 404 assumé — tous les liens
     internes viennent de la base, donc d'un slug valide. */
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
 * Un espace : son en-tête, puis le fil de l'accueil restreint à cet espace.
 *
 * Aucun composant du fil ne change — `FeedSection` prenait déjà `pathname` en
 * prop pour ce jour-là, et le `category` de `Feed` était posé d'avance. Seul le
 * slug descend en plus.
 *
 * Ni `params` ni `searchParams` ne sont attendus ici : ce sont des lectures de
 * la requête, et les attendre dans le corps de la page la rendrait bloquante en
 * entier. Chaque moitié vit donc sous sa frontière et attend sa propre donnée,
 * comme `page.tsx` le fait pour l'accueil.
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
