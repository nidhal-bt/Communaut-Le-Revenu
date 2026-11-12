import type { StrapiDocument } from "@/types/strapi";

/**
 * Toutes les relations sont optionnelles : Strapi ne les peuple jamais d'office,
 * donc elles sont absentes de la réponse tant qu'un `populate` ne les demande pas.
 */

export type User = {
  id: number;
  documentId: string;
  username: string;
  email: string;
};

/**
 * Le sanitizer de Strapi retire la relation `author` des réponses publiques ; les
 * contrôleurs la rattachent eux-mêmes, réduite à ces deux champs. Ni `id` ni
 * `email` : ce n'est donc pas un `User`.
 */
export type PublicAuthor = {
  documentId: string;
  username: string;
};

export type DiscussionType = "question" | "discussion";

export type Category = StrapiDocument & {
  /** Unique, 60 caractères maximum. */
  name: string;
  /** `uid` dérivé de `name`. */
  slug: string;
  /** 300 caractères maximum, facultatif côté backend. */
  description: string | null;
  /** Nom d'icône Lucide, par exemple `piggy-bank`. */
  icon: string;
  /** Couleur `#rrggbb` validée par le backend. Alimente `--tile-color`. */
  color: string;
  discussions?: Discussion[];
};

export type Discussion = StrapiDocument & {
  /** Entre 10 et 150 caractères. */
  title: string;
  content: string;
  type: DiscussionType;
  /** `null` sur les lignes écrites avant la colonne : à rendre `replyCount ?? 0`. */
  replyCount: number | null;
  /** Rattaché par le contrôleur. `null` si le compte a été supprimé. */
  author?: PublicAuthor | null;
  category?: Category;
  replies?: Reply[];
};

export type Reply = StrapiDocument & {
  content: string;
  /** Rattaché par le contrôleur. `null` si le compte a été supprimé. */
  author?: PublicAuthor | null;
  discussion?: Discussion;
};
