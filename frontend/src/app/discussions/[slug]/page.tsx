import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscussionBreadcrumb } from "@/components/discussion/discussion-breadcrumb";
import {
  DiscussionPost,
  DiscussionPostSkeleton,
} from "@/components/discussion/discussion-post";
import { RelatedDiscussions } from "@/components/discussion/related-discussions";
import {
  RepliesSection,
  RepliesSkeleton,
} from "@/components/discussion/replies-section";
import { documentIdFromSlug } from "@/lib/discussion-slug";
import { fetchDiscussion } from "@/lib/strapi/discussions";
import { fetchReplies } from "@/lib/strapi/replies";

type DiscussionParams = PageProps<"/discussions/[slug]">["params"];

const DESCRIPTION_LENGTH = 160;

const excerpt = (content: string): string => {
  const flat = content.replace(/\s+/g, " ").trim();

  return flat.length <= DESCRIPTION_LENGTH
    ? flat
    : `${flat.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…`;
};

/**
 * `fetchDiscussion` passe par `cache` de React : cette lecture, celle du corps
 * de la page et celle du bloc « À lire aussi » n'en font qu'une.
 *
 * Pas d'URL canonique : `metadataBase` n'est posé nulle part, une valeur
 * relative serait donc résolue contre `localhost`. Et pas de redirection quand
 * le slug ne correspond plus au titre — les deux adresses servent la même page,
 * l'identifiant seul faisant l'identité, et rediriger depuis le corps de la
 * page demanderait d'y attendre `params`, ce qui rendrait toute la route
 * bloquante.
 *
 * Le `try` ne couvre pas une discussion absente — `fetchDiscussion` renvoie `null`
 * pour ça — mais un backend injoignable. `next build` prérend la coquille de
 * la route, et `generateMetadata` n'est sous aucune frontière de Suspense :
 * sans ce filet, construire l'image frontend imposerait d'avoir déjà l'API
 * debout. Le vrai 404 reste décidé dans le corps de la page.
 */
export const generateMetadata = async ({
  params,
}: PageProps<"/discussions/[slug]">): Promise<Metadata> => {
  const { slug } = await params;

  try {
    const discussion = await fetchDiscussion(documentIdFromSlug(slug));

    if (!discussion) return {};

    return {
      title: discussion.title,
      description: excerpt(discussion.content),
    };
  } catch {
    return {};
  }
};

const DiscussionMain = async ({ params }: { params: DiscussionParams }) => {
  const { slug } = await params;
  const discussion = await fetchDiscussion(documentIdFromSlug(slug));

  /* Un identifiant inconnu rend bien la page de 404, mais sous un statut 200 :
     la coquille est déjà partie quand cette lecture aboutit. Soft 404 assumé,
     comme pour un espace — tous les liens internes viennent de la base, donc
     d'un identifiant valide. */
  if (!discussion) notFound();

  return (
    <div className="flex flex-col gap-2.5">
      <DiscussionBreadcrumb category={discussion.category} />
      <DiscussionPost discussion={discussion} />
    </div>
  );
};

const RepliesThread = async ({ params }: { params: DiscussionParams }) => {
  const { slug } = await params;
  const documentId = documentIdFromSlug(slug);
  const { replies, total } = await fetchReplies(documentId);

  return (
    <RepliesSection
      replies={replies}
      total={total}
      discussionDocumentId={documentId}
    />
  );
};

const RelatedSection = async ({ params }: { params: DiscussionParams }) => {
  const { slug } = await params;
  const discussion = await fetchDiscussion(documentIdFromSlug(slug));

  if (!discussion?.category) return null;

  return (
    <RelatedDiscussions
      category={discussion.category}
      excludeDocumentId={discussion.documentId}
    />
  );
};

/**
 * Une discussion : son en-tête, son fil de réponses, puis trois lectures
 * voisines dans le même espace.
 *
 * Trois frontières sœurs plutôt qu'une seule : le fil ne dépend que de
 * l'identifiant tiré de l'URL, et non de la lecture de la discussion — les deux
 * circulent donc vraiment en parallèle. Le bloc « À lire aussi » a besoin de
 * l'espace mais doit s'afficher *après* le fil, d'où une troisième frontière
 * qui relit la discussion : même entrée de cache, dédoublonnée par `cache`.
 *
 * `params` n'est pas attendu ici : ce serait une lecture de la requête, et
 * l'attendre dans le corps de la page la rendrait bloquante en entier. Chaque
 * enfant vit sous sa frontière et attend sa propre donnée, comme le fait la
 * page d'un espace.
 */
export default function DiscussionPage({
  params,
}: PageProps<"/discussions/[slug]">) {
  return (
    <div className="flex flex-col gap-[18px]">
      <Suspense fallback={<DiscussionPostSkeleton />}>
        <DiscussionMain params={params} />
      </Suspense>

      <Suspense fallback={<RepliesSkeleton />}>
        <RepliesThread params={params} />
      </Suspense>

      <Suspense fallback={null}>
        <RelatedSection params={params} />
      </Suspense>
    </div>
  );
}
