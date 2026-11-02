import type { Core } from '@strapi/strapi';

export default async function backdate(
  strapi: Core.Strapi,
  table: string,
  documentId: string,
  daysAgo: number,
) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  await strapi.db
    .connection(table)
    .where({ document_id: documentId })
    .update({ created_at: date, updated_at: date });
}