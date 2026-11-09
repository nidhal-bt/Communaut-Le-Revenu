import type { Core } from '@strapi/strapi';

export type PublicAuthor = {
  documentId: string;
  username: string;
};

type AuthorRow =
  | {
      documentId?: string | null;
      username?: string | null;
    }
  | null
  | undefined;

type AuthoredUID = 'api::discussion.discussion' | 'api::reply.reply';

export const toPublicAuthor = (author: AuthorRow): PublicAuthor | null => {
  if (!author?.documentId || !author.username) return null;

  return { documentId: author.documentId, username: author.username };
};

/**
 * Rattache l'auteur aux entrées déjà passées par le sanitizer de Strapi.
 *
 * Le sanitizer retire la relation `author` de toute réponse publique : aucun
 * rôle ne détient `plugin::users-permissions.user.find`, et on ne veut pas la
 * lui donner — cela ouvrirait `/api/users`. On relit donc l'auteur par la
 * couche `db`, qui ne passe pas par le sanitizer, en ne sélectionnant que deux
 * colonnes : `email`, `password` et les jetons de réinitialisation ne sortent
 * jamais de la base.
 */
export const attachAuthors = async <T extends { documentId: string }>(
  strapi: Core.Strapi,
  uid: AuthoredUID,
  entries: T[],
): Promise<void> => {
  const documentIds = entries.map((entry) => entry?.documentId).filter(Boolean);

  if (!documentIds.length) return;

  const rows: { documentId: string; author: AuthorRow }[] = await strapi.db
    .query(uid)
    .findMany({
      select: ['documentId'],
      where: { documentId: { $in: documentIds } },
      populate: { author: { select: ['documentId', 'username'] } },
    });

  const authors = new Map(
    rows.map((row) => [row.documentId, toPublicAuthor(row.author)]),
  );

  for (const entry of entries) {
    if (!entry) continue;

    (entry as { author?: PublicAuthor | null }).author =
      authors.get(entry.documentId) ?? null;
  }
};
