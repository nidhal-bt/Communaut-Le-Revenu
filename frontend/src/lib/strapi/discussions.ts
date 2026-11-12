/**
 * Next remplit les portées `use cache` au `build` : une portée qui lève y fait
 * échouer l'export dès que Strapi n'écoute pas. L'échec est donc renvoyé en
 * valeur et jamais levé, et `cacheLife` est appelé par branche — le profil réel
 * après une lecture réussie, `cacheLife("seconds")` dans le `catch`, pour ne pas
 * figer une panne le temps du profil long. Exactement un appel par invocation.
 */

import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { queryForFeedTab, type FeedTabKey } from "@/lib/feed-tabs";
import type { Discussion, DiscussionType } from "@/types/models";
import type { StrapiCollection, StrapiSingle } from "@/types/strapi";
import { StrapiError, strapiFetch } from "./client";
import {
  categoryTag,
  discussionTag,
  HOME_FEED_TAG,
  topOfWeekTag,
} from "./tags";

const DISCUSSION_FIELDS = [
  "title",
  "content",
  "type",
  "replyCount",
  "createdAt",
  "updatedAt",
];

// Le sanitizer retire `author` : le contrôleur le rattache lui-même. La
// projection reste demandée pour que la requête tienne si la règle change.
const DISCUSSION_POPULATE = {
  author: { fields: ["username"] },
  category: { fields: ["name", "slug", "icon", "color"] },
};

const PAGE_SIZE = 20;

export type DiscussionFeed = {
  discussions: Discussion[];
  pageCount: number;
};

/** `stale: 30` est le plancher du routeur client : en dessous, la valeur est ignorée. */
export const fetchDiscussions = async (
  tab: FeedTabKey,
  page: number,
  userId?: number,
  categorySlug?: string,
): Promise<DiscussionFeed> => {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  /* `categorySlug` sépare déjà les entrées : l'étiquette suit la clé, et
     publier dans un espace ne périme pas le fil des autres. */
  cacheTag(categorySlug ? categoryTag(categorySlug) : HOME_FEED_TAG);

  try {
    const { data, meta } = await strapiFetch<StrapiCollection<Discussion>>(
      "/discussions",
      {
        query: {
          ...queryForFeedTab(tab, userId, categorySlug),
          fields: DISCUSSION_FIELDS,
          populate: DISCUSSION_POPULATE,
          pagination: { page, pageSize: PAGE_SIZE },
        },
      },
    );

    return { discussions: data, pageCount: meta.pagination.pageCount };
  } catch {
    return { discussions: [], pageCount: 0 };
  }
};

type DiscussionRead =
  | { discussion: Discussion }
  | { missing: true }
  | { failed: true };

/** Étiquetée par document : une réponse ne doit pas périmer toutes les autres lectures. */
const readDiscussion = async (documentId: string): Promise<DiscussionRead> => {
  "use cache";
  cacheTag(discussionTag(documentId));

  try {
    const { data } = await strapiFetch<StrapiSingle<Discussion>>(
      `/discussions/${documentId}`,
      { query: { fields: DISCUSSION_FIELDS, populate: DISCUSSION_POPULATE } },
    );

    cacheLife({ stale: 30, revalidate: 60, expire: 300 });

    return { discussion: data };
  } catch (error) {
    cacheLife("seconds");

    if (error instanceof StrapiError && error.status === 404) {
      return { missing: true };
    }

    return { failed: true };
  }
};

/**
 * Seule l'absence devient `null` ; la panne lève. Les confondre ferait passer un
 * backend éteint pour « cette discussion n'existe pas », et rendrait un 404.
 */
export const fetchDiscussion = cache(
  async (documentId: string): Promise<Discussion | null> => {
    const result = await readDiscussion(documentId);

    if ("discussion" in result) return result.discussion;
    if ("missing" in result) return null;

    throw new Error(`Lecture impossible de la discussion ${documentId}`);
  },
);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Une semaine vide et un backend éteint ne doivent pas se ressembler. */
export type TopOfWeek = { discussions: Discussion[] } | { failed: true };

/**
 * `Date.now()` est appelé *dans* la portée `use cache`, seule place où il peut
 * l'être : ailleurs, `cacheComponents` en fait une erreur de build. La valeur est
 * capturée dans l'entrée, le bord de la fenêtre a donc le retard du profil.
 *
 * `createdAt` et non `publishedAt` : `draftAndPublish` est désactivé sur les trois
 * types de contenu. Et une panne renvoyée plutôt que levée : le rail est monté dans
 * le layout, où lever ferait tomber toutes les routes pour une carte décorative.
 */
export const fetchTopOfWeek = async (
  type: DiscussionType,
  limit: number,
): Promise<TopOfWeek> => {
  "use cache";
  cacheTag(topOfWeekTag(type));

  try {
    const { data } = await strapiFetch<StrapiCollection<Discussion>>(
      "/discussions",
      {
        query: {
          filters: {
            type: { $eq: type },
            createdAt: { $gte: new Date(Date.now() - WEEK_MS).toISOString() },
          },
          fields: DISCUSSION_FIELDS,
          populate: DISCUSSION_POPULATE,
          /* Postgres ne garantit aucun ordre entre ex aequo : la plus
             récente doit gagner. */
          sort: ["replyCount:desc", "createdAt:desc"],
          pagination: { pageSize: limit },
        },
      },
    );

    cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

    return { discussions: data };
  } catch {
    cacheLife("seconds");

    return { failed: true };
  }
};

export type DiscussionSearch =
  | { discussions: Discussion[]; pageCount: number; total: number }
  | { failed: true };

/**
 * Sans `use cache`, contrairement aux lectures ci-dessus : un texte libre
 * fabriquerait une entrée par recherche distincte. L'appelant doit donc se tenir
 * sous une frontière `<Suspense>`.
 *
 * `$containsi` est insensible à la casse mais pas aux accents : « impots » ne
 * trouve pas « impôts ».
 */
export const searchDiscussions = async (
  query: string,
  page: number,
): Promise<DiscussionSearch> => {
  try {
    const { data, meta } = await strapiFetch<StrapiCollection<Discussion>>(
      "/discussions",
      {
        query: {
          filters: {
            $or: [
              { title: { $containsi: query } },
              { content: { $containsi: query } },
            ],
          },
          /* Strapi ne calcule aucune pertinence : la plus suivie passe devant. */
          sort: ["replyCount:desc", "createdAt:desc"],
          fields: DISCUSSION_FIELDS,
          populate: DISCUSSION_POPULATE,
          pagination: { page, pageSize: PAGE_SIZE },
        },
      },
    );

    return {
      discussions: data,
      pageCount: meta.pagination.pageCount,
      total: meta.pagination.total,
    };
  } catch {
    return { failed: true };
  }
};
