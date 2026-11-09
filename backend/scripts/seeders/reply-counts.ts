import type { Core } from '@strapi/strapi';

type Row = {
  id: number;
  replyCount: number | null;
  updatedAt: string | Date;
  replies: { createdAt: string | Date }[];
};

const latestReply = (replies: Row['replies']): Date | null =>
  replies.reduce<Date | null>((latest, reply) => {
    const date = new Date(reply.createdAt);
    return latest === null || date > latest ? date : latest;
  }, null);

const sameInstant = (a: string | Date, b: Date) =>
  new Date(a).getTime() === b.getTime();

/**
 * Recale `replyCount` sur les réponses réellement liées, et `updatedAt` sur la
 * date de la dernière d'entre elles.
 *
 * Le compteur est dénormalisé et seul le lifecycle des réponses l'incrémente,
 * uniquement à la création par l'API : une discussion écrite avant l'ajout de
 * la colonne vaut donc NULL, et une réponse déplacée dans l'admin laisse deux
 * compteurs faux. Cette étape ferme le seed et remet les deux d'accord.
 *
 * `updatedAt` ne bouge pas tout seul — ni `backdate`, ni l'incrément SQL du
 * lifecycle n'y touchent. C'est pourtant ce que la vue compacte affiche sous
 * « Activité » : sans ce recalage, la colonne répète la date de création.
 *
 * L'écriture passe par Knex, comme le lifecycle : le document service
 * réécrirait `updatedAt` au moment même où on le fixe.
 */
export default async function seedReplyCounts(strapi: Core.Strapi) {
  const discussions: Row[] = await strapi.db
    .query('api::discussion.discussion')
    .findMany({
      select: ['id', 'replyCount', 'updatedAt'],
      populate: { replies: { select: ['createdAt'] } },
    });

  let fixed = 0;

  for (const discussion of discussions) {
    const replies = discussion.replies ?? [];
    const lastActivity = latestReply(replies);
    const patch: { reply_count?: number; updated_at?: Date } = {};

    if (discussion.replyCount !== replies.length) {
      patch.reply_count = replies.length;
    }

    if (lastActivity && !sameInstant(discussion.updatedAt, lastActivity)) {
      patch.updated_at = lastActivity;
    }

    if (Object.keys(patch).length === 0) continue;

    await strapi.db.connection('discussions').where({ id: discussion.id }).update(patch);
    fixed++;
  }

  console.log(`Compteurs de réponses : ${fixed} corrigés sur ${discussions.length}`);
}
