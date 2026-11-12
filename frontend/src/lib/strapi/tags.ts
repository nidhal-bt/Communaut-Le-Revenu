/**
 * Module à part pour que les Server Actions nomment les mêmes étiquettes sans
 * importer un module de lecture — et donc sans tirer ses portées `use cache`
 * dans leur propre graphe.
 */

import type { DiscussionType } from "@/types/models";

export const HOME_FEED_TAG = "feed:home";

export const categoryTag = (slug: string): string => `category:${slug}`;

export const discussionTag = (documentId: string): string =>
  `discussion:${documentId}`;

export const repliesTag = (discussionDocumentId: string): string =>
  `replies:${discussionDocumentId}`;

/** Une étiquette par type : répondre à une question ne périme pas les discussions. */
export const topOfWeekTag = (type: DiscussionType): string =>
  `top-week:${type}`;
