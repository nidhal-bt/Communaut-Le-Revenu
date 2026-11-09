import { cacheLife } from "next/cache";
import { queryForFeedTab, type FeedTabKey } from "@/lib/feed-tabs";
import type { Discussion } from "@/types/models";
import type { StrapiCollection } from "@/types/strapi";
import { strapiFetch } from "./client";

const PAGE_SIZE = 20;

/**
 * La première page du fil pour un onglet donné.
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
): Promise<Discussion[]> => {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });

  try {
    const { data } = await strapiFetch<StrapiCollection<Discussion>>(
      "/discussions",
      {
        query: {
          ...queryForFeedTab(tab),
          fields: [
            "title",
            "content",
            "type",
            "replyCount",
            "createdAt",
            "updatedAt",
          ],
          // Le contrôleur rattache `author` lui-même, le sanitizer le retirant
          // de toute façon ; on demande malgré tout la projection voulue, pour
          // que la requête reste juste si cette règle change un jour.
          populate: {
            author: { fields: ["username"] },
            category: { fields: ["name", "slug", "icon", "color"] },
          },
          pagination: { pageSize: PAGE_SIZE },
        },
      },
    );

    return data;
  } catch {
    return [];
  }
};
