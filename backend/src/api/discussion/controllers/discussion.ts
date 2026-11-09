import { Core, factories } from '@strapi/strapi';
import { attachAuthors, toPublicAuthor } from '../../../utils/attach-authors';

type DiscussionInput = {
  title: string;
  content: string;
  type: string;
  category: string;
  author: number;
};

export default factories.createCoreController(
  'api::discussion.discussion',
  ({ strapi }) => ({
    async find(ctx) {
      const response = await super.find(ctx);

      await attachAuthors(strapi, 'api::discussion.discussion', response.data);

      return response;
    },

    async findOne(ctx) {
      const response = await super.findOne(ctx);

      await attachAuthors(strapi, 'api::discussion.discussion', [response.data]);

      return response;
    },

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour publier.');
      }

      const { title, content, type, category } = ctx.request.body?.data ?? {};

      const data = {
        title: typeof title === 'string' ? title.trim() : '',
        content: typeof content === 'string' ? content.trim() : '',
        type,
        category,
        author: user.id,
        // `replyCount` est `required` : le défaut du schéma ne dispense pas de
        // l'envoyer, et il n'est jamais lu du client — une discussion naît à
        // zéro, le lifecycle des réponses s'occupe de la suite.
        replyCount: 0,
      };

      const errors = await validate(strapi, data);

      if (Object.keys(errors).length) {
        return ctx.badRequest('Validation échouée', { errors });
      }

      const discussion = await strapi.documents('api::discussion.discussion').create({
        data,
        populate: ['author', 'category'],
      });

      ctx.status = 201;
      return {
        data: { ...discussion, author: toPublicAuthor(discussion.author) },
      };
    },
  }),
);

async function validate(strapi: Core.Strapi, data: DiscussionInput) {
  const errors: Record<string, string> = {};

  if (data.title.length < 10) {
    errors.title = 'Le titre doit contenir au moins 10 caractères.';
  } else if (data.title.length > 150) {
    errors.title = 'Le titre ne peut pas dépasser 150 caractères.';
  }

  if (!data.content) {
    errors.content = 'Le contenu est obligatoire.';
  }

  if (!['question', 'discussion'].includes(data.type)) {
    errors.type = 'Le type doit être « question » ou « discussion ».';
  }

  if (!data.category) {
    errors.category = "L'espace est obligatoire.";
  } else {
    const exists = await strapi
      .documents('api::category.category')
      .findOne({ documentId: data.category });

    if (!exists) errors.category = "Cet espace n'existe pas.";
  }

  return errors;
}