import { DiscussionCard } from "@/components/feed/discussion-card";
import { FEED_SHELL } from "@/components/feed/feed-list";
import { fetchDiscussions } from "@/lib/strapi/discussions";
import type { Category } from "@/types/models";
import { SECTION_TITLE } from "./post-shell";

/**
 * « À lire aussi dans {espace} » : trois discussions du même espace.
 *
 * `tendances` trie par nombre de réponses puis par date, ce dont le `hot()` de
 * la maquette s'approche. Les trois arguments sont exactement ceux que la page
 * d'un espace passe déjà : la lecture partage donc son entrée de cache et ne
 * coûte aucune requête supplémentaire.
 *
 * Le filtre vient avant la coupe — couper d'abord laisserait deux cartes
 * lorsque trois existent.
 */
export const RelatedDiscussions = async ({
  category,
  excludeDocumentId,
}: {
  category: Category;
  excludeDocumentId: string;
}) => {
  const discussions = await fetchDiscussions(
    "tendances",
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
