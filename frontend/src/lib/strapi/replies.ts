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
 * Le total vient de `meta.pagination` et non de `data.length` : passé cent
 * réponses, la longueur du tableau cesserait d'être la réponse sans rien signaler.
 *
 * Un échec renvoie un fil vide plutôt que de lever : cette lecture ne décide
 * d'aucun 404, et la discussion peut encore venir du cache quand Strapi s'arrête.
 */
export const fetchReplies = async (
  discussionDocumentId: string,
): Promise<DiscussionReplies> => {
  "use cache";
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

    cacheLife({ stale: 30, revalidate: 60, expire: 300 });

    return { replies: data, total: meta.pagination.total };
  } catch {
    cacheLife("seconds");

    return { replies: [], total: 0 };
  }
};

/**
 * Une lecture à part plutôt que la fin de `fetchReplies` : celle-ci tire jusqu'à
 * cent lignes, là où le bloc n'en affiche qu'une. Même étiquette que l'autre, que
 * `reply-actions.ts` périme déjà.
 */
export const fetchLatestReply = async (
  discussionDocumentId: string,
): Promise<Reply | null> => {
  "use cache";
  cacheTag(repliesTag(discussionDocumentId));

  try {
    const { data } = await strapiFetch<StrapiCollection<Reply>>("/replies", {
      query: {
        filters: { discussion: { documentId: { $eq: discussionDocumentId } } },
        fields: ["content", "createdAt"],
        populate: { author: { fields: ["username"] } },
        sort: ["createdAt:desc"],
        pagination: { pageSize: 1 },
      },
    });

    cacheLife({ stale: 30, revalidate: 60, expire: 300 });

    return data[0] ?? null;
  } catch {
    cacheLife("seconds");

    return null;
  }
};
