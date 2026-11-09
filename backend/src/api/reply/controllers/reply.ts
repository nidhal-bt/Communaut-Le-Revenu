import { factories } from "@strapi/strapi";
import { attachAuthors, toPublicAuthor } from "../../../utils/attach-authors";

export default factories.createCoreController(
  "api::reply.reply",
  ({ strapi }) => ({
    async find(ctx) {
      const response = await super.find(ctx);

      await attachAuthors(strapi, "api::reply.reply", response.data);

      return response;
    },

    async findOne(ctx) {
      const response = await super.findOne(ctx);

      await attachAuthors(strapi, "api::reply.reply", [response.data]);

      return response;
    },

    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Vous devez être connecté pour répondre.");
      }

      const { content, discussion } = ctx.request.body?.data ?? {};

      const data = {
        content: typeof content === "string" ? content.trim() : "",
        discussion,
        author: user.id,
      };

      const errors: Record<string, string> = {};

      if (!data.content) {
        errors.content = "La réponse ne peut pas être vide.";
      }

      if (!data.discussion) {
        errors.discussion = "La discussion est obligatoire.";
      } else {
        const exists = await strapi
          .documents("api::discussion.discussion")
          .findOne({ documentId: data.discussion });

        if (!exists) errors.discussion = "Cette discussion n'existe pas.";
      }

      if (Object.keys(errors).length) {
        return ctx.badRequest("Validation échouée", { errors });
      }

      const reply = await strapi.documents("api::reply.reply").create({
        data,
        populate: ["author"],
      });

      ctx.status = 201;
      return { data: { ...reply, author: toPublicAuthor(reply.author) } };
    },
  }),
);
