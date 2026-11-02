import type { Core } from '@strapi/strapi';
import readData from './read-data';

type Category = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
};

export default async function seedCategories(strapi: Core.Strapi) {
  const items = await readData<Category>(strapi, 'categories.json');
  const result = [];

  for (const data of items) {
    const existing = await strapi
      .documents('api::category.category')
      .findFirst({ filters: { slug: data.slug } });

    result.push(existing ?? (await strapi.documents('api::category.category').create({ data })));
  }

  console.log(`Catégories : ${result.length}`);
  return result;
}