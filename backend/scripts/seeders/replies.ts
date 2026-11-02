import type { Core } from '@strapi/strapi';
import readData from './read-data';
import backdate from './backdate';

type Reply = {
  content: string;
  discussion: number;
  author: number;
  daysAgo: number;
};

export default async function seedReplies(
  strapi: Core.Strapi,
  discussions: any[],
  users: any[],
) {
  const items = await readData<Reply>(strapi, 'replies.json');
  let count = 0;

  for (const item of items) {
    const existing = await strapi
      .documents('api::reply.reply')
      .findFirst({ filters: { content: item.content } });

    if (existing) continue;

    const discussion = discussions[item.discussion];
    if (!discussion) {
      throw new Error(`Discussion n°${item.discussion} introuvable`);
    }

    const author = users[item.author];
    if (!author) {
      throw new Error(`Auteur n°${item.author} introuvable`);
    }

    const created = await strapi.documents('api::reply.reply').create({
      data: {
        content: item.content,
        discussion: discussion.documentId,
        author: author.id,
      },
    });

    await backdate(strapi, 'replies', created.documentId, item.daysAgo);
    count++;
  }

  console.log(`Réponses : ${count}`);
}