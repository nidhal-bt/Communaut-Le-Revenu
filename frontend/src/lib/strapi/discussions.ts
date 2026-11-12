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

type DiscussionRead =
  | { discussion: Discussion }
  | { missing: true }
  | { failed: true };

/**
 * La lecture mise en cache : la discussion, son absence, ou la panne.
 *
 * Étiquetée par document, et jamais avec celle d'un fil : une réponse sur une
 * discussion n'a aucune raison de périmer la lecture de toutes les autres.
 *
 * Les trois issues sont distinguées *dans* la portée mise en cache et non
 * autour, parce que Next remplit ces caches au `build` : une portée qui lève
 * y fait échouer l'export dès que Strapi n'écoute pas, et construire l'image
 * frontend imposerait alors d'avoir déjà l'API debout. Ce que la découpe
 * d'avant protégeait — ne pas figer une panne cinq minutes — revient au
 * `cacheLife('seconds')` des branches négatives.
 */
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
 * Une discussion depuis son `documentId`, ou `null` si elle n'existe pas.
 *
 * Seule l'absence devient `null` ; la panne lève. Les confondre ferait passer
 * un backend éteint pour « cette discussion n'existe pas », et la page rendrait
 * un 404 au lieu d'une erreur.
 *
 * `cache` de React dédoublonne les trois lectures d'une même requête —
 * `generateMetadata`, le fil de discussion et le bloc « À lire aussi ».
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
 * du profil de la branche réussie — une heure au plus, sur sept jours. Ce
 * profil est long exprès : la fraîcheur vient des étiquettes, que les deux
 * actions périment.
 *
 * La panne est décidée *dans* la portée, et pas autour : Next remplit ces
 * caches au `build`, où lever ferait échouer l'export dès que Strapi n'écoute
 * pas. Le `cacheLife('seconds')` de la branche d'échec évite ce que la découpe
 * d'avant évitait — une carte qui annonce encore la panne une heure après le
 * retour de Strapi. Et une panne plutôt qu'une exception : le rail est monté
 * dans le layout, où lever ferait tomber toutes les routes sur `app/error.tsx`
 * pour une carte décorative.
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
          /* `createdAt` départage, comme l'onglet « tendances » : Postgres ne
             garantit aucun ordre entre ex æquo, et la plus récente doit
             gagner. */
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

/**
 * Le résultat d'une recherche, ou la panne.
 *
 * Même distinction que `TopOfWeek`, et pour la même raison : une liste vide
 * ferait dire « aucune discussion trouvée » à un backend éteint.
 */
export type DiscussionSearch =
  | { discussions: Discussion[]; pageCount: number; total: number }
  | { failed: true };

/**
 * Les discussions dont le titre ou le contenu portent la recherche.
 *
 * Sans `use cache`, contrairement aux lectures ci-dessus : les arguments en
 * forment la clé, et un texte libre y fabriquerait une entrée par recherche
 * distincte. L'appelant doit donc se tenir sous une frontière `<Suspense>`.
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
          /* Le tri de « Tendances » : à pertinence égale — Strapi ne la calcule
             pas —, la discussion la plus suivie passe devant. */
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
