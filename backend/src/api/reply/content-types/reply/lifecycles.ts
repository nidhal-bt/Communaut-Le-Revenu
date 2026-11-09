import type { Event } from '@strapi/database';

/**
 * `replyCount` sur la discussion est dénormalisé : il est tenu à jour ici,
 * à chaque réponse créée ou supprimée.
 */
export default {
  async afterCreate(event: Event) {
    // Les relations sont rattachées avant ce hook : le lien vers la discussion
    // est donc déjà lisible.
    const documentId = await findDiscussionDocumentId({ id: event.result.id });

    await addOneReply(documentId);
  },

  async beforeDelete(event: Event) {
    // Le lien disparaît avec la ligne : on le lit avant la suppression et on le
    // transmet à `afterDelete` par `event.state`.
    event.state.discussionDocumentId = await findDiscussionDocumentId(event.params.where);
  },

  async afterDelete(event: Event) {
    const { discussionDocumentId } = event.state;

    await removeOneReply(typeof discussionDocumentId === 'string' ? discussionDocumentId : null);
  },
};

async function findDiscussionDocumentId(where: unknown): Promise<string | null> {
  if (!where) return null;

  const reply = await strapi.db.query('api::reply.reply').findOne({
    where,
    populate: { discussion: { select: ['documentId'] } },
  });

  return reply?.discussion?.documentId ?? null;
}

/**
 * L'incrément est fait par la base, pas en JavaScript : deux réponses
 * simultanées ne peuvent pas écraser le compteur l'une de l'autre.
 *
 * `coalesce` couvre les discussions créées avant l'ajout de la colonne, dont
 * le compteur vaut NULL — `reply_count + 1` y resterait NULL.
 *
 * `strapi.db.transaction()` réutilise la transaction en cours si elle existe :
 * une création annulée n'avance donc pas le compteur.
 */
async function addOneReply(discussionDocumentId: string | null) {
  if (!discussionDocumentId) return;

  await strapi.db.transaction(async ({ trx }) => {
    await strapi.db
      .connection('discussions')
      .transacting(trx)
      .where({ document_id: discussionDocumentId })
      .update({ reply_count: strapi.db.connection.raw('coalesce(reply_count, 0) + 1') });
  });
}

/**
 * `where('reply_count', '>', 0)` est faux pour NULL : un compteur jamais
 * initialisé vaut zéro et le décrément ne peut pas passer sous zéro.
 */
async function removeOneReply(discussionDocumentId: string | null) {
  if (!discussionDocumentId) return;

  await strapi.db.transaction(async ({ trx }) => {
    await strapi.db
      .connection('discussions')
      .transacting(trx)
      .where({ document_id: discussionDocumentId })
      .where('reply_count', '>', 0)
      .decrement('reply_count', 1);
  });
}
