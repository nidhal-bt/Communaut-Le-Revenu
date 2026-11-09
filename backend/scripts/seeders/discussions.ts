import type { Core } from '@strapi/strapi';
import readData from './read-data';
import backdate from './backdate';

type Discussion = {
  title: string;
  content: string;
  type: 'question' | 'discussion';
  category: string;
  author: number;
  daysAgo: number;
};

export default async function seedDiscussions(
  strapi: Core.Strapi,
  categories: any[],
  users: any[],
) {
  const items = await readData<Discussion>(strapi, 'discussions.json');
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const result = [];

  for (const item of items) {
    const existing = await strapi
      .documents('api::discussion.discussion')
      .findFirst({ filters: { title: item.title } });

    if (existing) {
      result.push(existing);
      continue;
    }

    const category = bySlug.get(item.category);
    if (!category) {
      throw new Error(`Catégorie « ${item.category} » introuvable (${item.title})`);
    }

    const author = users[item.author];
    if (!author) {
      throw new Error(`Auteur n°${item.author} introuvable (${item.title})`);
    }

    const created = await strapi.documents('api::discussion.discussion').create({
      data: {
        title: item.title,
        content: item.content,
        type: item.type,
        category: category.documentId,
        author: author.id,
        // `required` depuis le schéma : à envoyer même avec un défaut. Les
        // réponses semées juste après le feront monter.
        replyCount: 0,
      },
    });

    await backdate(strapi, 'discussions', created.documentId, item.daysAgo);
    result.push(created);
  }

  console.log(`Discussions : ${result.length}`);
  return result;
}