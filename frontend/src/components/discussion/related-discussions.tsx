import { DiscussionCard } from "@/components/feed/discussion-card";
import { FEED_SHELL } from "@/components/feed/feed-list";
import { DEFAULT_FEED_PAGE } from "@/lib/feed-url";
import { fetchDiscussions } from "@/lib/strapi/discussions";
import type { Category } from "@/types/models";
import { SECTION_TITLE } from "./post-shell";

/**
 * Les arguments sont exactement ceux que la page d'un espace passe déjà pour sa
 * **première** page : la lecture partage donc son entrée de cache et ne coûte
 * aucune requête supplémentaire.
 *
 * Le filtre vient avant la coupe — couper d'abord laisserait deux cartes lorsque
 * trois existent.
 */
export const RelatedDiscussions = async ({
  category,
  excludeDocumentId,
}: {
  category: Category;
  excludeDocumentId: string;
}) => {
  const { discussions } = await fetchDiscussions(
    "tendances",
    DEFAULT_FEED_PAGE,
    undefined,
    category.slug,
  );

  const related = discussions
    .filter((discussion) => discussion.documentId !== excludeDocumentId)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className={SECTION_TITLE}>À lire aussi dans {category.name}</h2>

      <div className={FEED_SHELL}>
        {related.map((discussion) => (
          <DiscussionCard key={discussion.documentId} discussion={discussion} />
        ))}
      </div>
    </section>
  );
};
