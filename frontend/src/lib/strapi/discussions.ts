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
 * Une page du fil, et de quoi en fabriquer le pager.
 *
 * `pageCount` plutôt que le `meta.pagination` entier : c'est le seul nombre
 * dont le pager a besoin, et `page` comme `pageSize` sont déjà connus de
 * l'appelant.
 */
export type DiscussionFeed = {
  discussions: Discussion[];
  pageCount: number;
};

/**
 * Une page du fil pour un onglet donné, éventuellement restreinte à un espace.
 *
 * `use cache` prend les arguments pour clé : chaque onglet a son entrée, et
 * chaque page la sienne. Le profil
 * est volontairement court — une minute avant de réinterroger Strapi — et
 * `stale: 30` est le plancher imposé par le routeur client, en dessous duquel
 * la valeur est ignorée.
 *
 * Le rôle public détient `discussion.find`, aucun jeton n'est donc nécessaire.
 * Comme `categories.ts`, un backend éteint renvoie une liste vide plutôt que de
 * faire tomber l'accueil — avec `pageCount: 0`, qui efface le pager.
 */
export const fetchDiscussions = async (
  tab: FeedTabKey,
  page: number,
  userId?: number,
  categorySlug?: string,
): Promise<DiscussionFeed> => {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  /* `categorySlug` est déjà ce qui sépare les entrées : sans lui on tient le
     fil de l'accueil, avec lui celui d'un espace. L'étiquette suit donc la
     clé, et publier dans un espace ne périme pas le fil des autres. */
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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Une semaine vide et un backend éteint ne doivent pas se ressembler : un
 * tableau nu confondrait les deux, et la carte annoncerait « rien cette
 * semaine » au milieu d'une panne.
 */
export type TopOfWeek = { discussions: Discussion[] } | { failed: true };

/**
 * Le haut du classement des sept derniers jours, pour les cartes du rail droit.
 *
 * `use cache` prend les arguments pour clé : la question et les discussions ont
 * chacune leur entrée, et chacune son étiquette — une réponse ne périme donc
 * que la carte du type de sa discussion parente.
 *
 * `createdAt` et non `publishedAt` : `draftAndPublish` est désactivé sur les
 * trois types de contenu, ce second champ ne signale donc aucun cycle de
 * publication.
 *
 * `Date.now()` est appelé *dans* la portée `use cache`, et c'est la seule place
 * où il peut l'être : ailleurs, `cacheComponents` en fait une erreur de build.
 * La valeur est capturée dans l'entrée, le bord de la fenêtre a donc le retard
 * du profil ci-dessous — une heure au plus, sur sept jours. Le profil est long
 * exprès : la fraîcheur vient des étiquettes, que les deux actions périment.
 */
const readTopOfWeek = async (
  type: DiscussionType,
  limit: number,
): Promise<Discussion[]> => {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });
  cacheTag(topOfWeekTag(type));

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
        /* `createdAt` départage, comme l'onglet « tendances » : Postgres ne
           garantit aucun ordre entre ex æquo, et la plus récente doit
           gagner. */
        sort: ["replyCount:desc", "createdAt:desc"],
        pagination: { pageSize: limit },
      },
    },
  );

  return data;
};

/**
 * La panne décidée *hors* de la portée mise en cache, pour la même raison que
 * `fetchDiscussion` plus bas : un `{ failed: true }` renvoyé depuis `use cache`
 * serait mis en cache comme n'importe quelle valeur, et la carte annoncerait
 * encore la panne une heure après le retour de Strapi.
 *
 * Et une panne plutôt qu'une exception : le rail est monté dans le layout, où
 * lever ferait tomber toutes les routes sur `app/error.tsx` pour une carte
 * décorative.
 */
export const fetchTopOfWeek = async (
  type: DiscussionType,
  limit: number,
): Promise<TopOfWeek> => {
  try {
    return { discussions: await readTopOfWeek(type, limit) };
  } catch {
    return { failed: true };
  }
};
