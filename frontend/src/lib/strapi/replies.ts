import { cacheLife, cacheTag } from "next/cache";
import type { Reply } from "@/types/models";
import type { StrapiCollection } from "@/types/strapi";
import { strapiFetch } from "./client";
import { repliesTag } from "./tags";

/** `maxLimit` vaut 100 côté backend : demander plus serait silencieusement rogné. */
const PAGE_SIZE = 100;

export type DiscussionReplies = {
  replies: Reply[];
  /** Le vrai total, qui peut dépasser `replies.length`. */
  total: number;
};

/**
 * Les réponses d'une discussion, de la plus ancienne à la plus récente.
 *
 * Le total vient de `meta.pagination` et non de `data.length` : passé cent
 * réponses, la longueur du tableau cesserait d'être la réponse sans rien
 * signaler. Le backend pose `withCount: true`, l'enveloppe est donc toujours
 * là et ne coûte rien.
 *
 * Contrairement à `fetchDiscussion`, un échec renvoie un fil vide plutôt que de
 * lever : cette lecture ne décide d'aucun 404, et la discussion elle-même peut
 * encore venir du cache quand Strapi s'arrête.
 */
export const fetchReplies = async (
  discussionDocumentId: string,
): Promise<DiscussionReplies> => {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  cacheTag(repliesTag(discussionDocumentId));

  try {
    const { data, meta } = await strapiFetch<StrapiCollection<Reply>>(
      "/replies",
      {
        query: {
          filters: {
            discussion: { documentId: { $eq: discussionDocumentId } },
          },
          fields: ["content", "createdAt"],
          populate: { author: { fields: ["username"] } },
          sort: ["createdAt:asc"],
          pagination: { pageSize: PAGE_SIZE },
        },
      },
    );

    return { replies: data, total: meta.pagination.total };
  } catch {
    return { replies: [], total: 0 };
  }
};
