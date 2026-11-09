import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { queryForFeedTab, type FeedTabKey } from "@/lib/feed-tabs";
import type { Discussion } from "@/types/models";
import type { StrapiCollection, StrapiSingle } from "@/types/strapi";
import { StrapiError, strapiFetch } from "./client";
import { categoryTag, discussionTag, HOME_FEED_TAG } from "./tags";

/** La projection partagée par le fil et la page d'une discussion. */
const DISCUSSION_FIELDS = [
  "title",
  "content",
  "type",
  "replyCount",
  "createdAt",
  "updatedAt",
];

// Le contrôleur rattache `author` lui-même, le sanitizer le retirant de toute
// façon ; on demande malgré tout la projection voulue, pour que la requête
// reste juste si cette règle change un jour.
const DISCUSSION_POPULATE = {
  author: { fields: ["username"] },
  category: { fields: ["name", "slug", "icon", "color"] },
};

const PAGE_SIZE = 20;

/**
 * La première page du fil pour un onglet donné, éventuellement restreinte à un
 * espace.
 *
 * `use cache` prend l'argument pour clé : chaque onglet a son entrée. Le profil
 * est volontairement court — une minute avant de réinterroger Strapi — et
 * `stale: 30` est le plancher imposé par le routeur client, en dessous duquel
 * la valeur est ignorée.
 *
 * Le rôle public détient `discussion.find`, aucun jeton n'est donc nécessaire.
 * Comme `categories.ts`, un backend éteint renvoie une liste vide plutôt que de
 * faire tomber l'accueil.
 */
export const fetchDiscussions = async (
  tab: FeedTabKey,
  userId?: number,
  categorySlug?: string,
): Promise<Discussion[]> => {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  /* `categorySlug` est déjà ce qui sépare les entrées : sans lui on tient le
     fil de l'accueil, avec lui celui d'un espace. L'étiquette suit donc la
     clé, et publier dans un espace ne périme pas le fil des autres. */
  cacheTag(categorySlug ? categoryTag(categorySlug) : HOME_FEED_TAG);

  try {
    const { data } = await strapiFetch<StrapiCollection<Discussion>>(
      "/discussions",
      {
        query: {
          ...queryForFeedTab(tab, userId, categorySlug),
          fields: DISCUSSION_FIELDS,
          populate: DISCUSSION_POPULATE,
          pagination: { pageSize: PAGE_SIZE },
        },
      },
    );

    return data;
  } catch {
    return [];
  }
};

/**
 * La lecture mise en cache, qui lève sur n'importe quel statut non-2xx.
 *
 * Étiquetée par document, et jamais avec celle d'un fil : une réponse sur une
 * discussion n'a aucune raison de périmer la lecture de toutes les autres.
 */
const readDiscussion = async (documentId: string): Promise<Discussion> => {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  cacheTag(discussionTag(documentId));

  const { data } = await strapiFetch<StrapiSingle<Discussion>>(
    `/discussions/${documentId}`,
    { query: { fields: DISCUSSION_FIELDS, populate: DISCUSSION_POPULATE } },
  );

  return data;
};

/**
 * Une discussion depuis son `documentId`, ou `null` si elle n'existe pas.
 *
 * La mise en cache et la décision du 404 sont séparées exprès. `fetchCategory`
 * renonce à `use cache` parce qu'il craint de mettre le *négatif* en cache ;
 * ici le négatif ne l'est jamais : la portée mise en cache lève, et le `null`
 * est fabriqué dehors, par une fonction sans directive.
 *
 * Seul un 404 devient `null`. Tout le reste est relancé : avaler l'erreur
 * ferait passer un backend éteint pour « cette discussion n'existe pas ».
 *
 * `cache` de React dédoublonne les trois lectures d'une même requête —
 * `generateMetadata`, le fil de discussion et le bloc « À lire aussi ».
 */
export const fetchDiscussion = cache(
  async (documentId: string): Promise<Discussion | null> => {
    try {
      return await readDiscussion(documentId);
    } catch (error) {
      if (error instanceof StrapiError && error.status === 404) return null;

      throw error;
    }
  },
);
