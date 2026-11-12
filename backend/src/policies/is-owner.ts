/**
 * Aucun rôle ne reçoit `update` ni `delete` : cette policy est une seconde
 * serrure, pour le jour où l'une d'elles serait cochée dans `/admin`. Le type de
 * contenu arrive par la route, pour qu'elle serve les deux collections.
 */
export default async (policyContext: any, config: any, { strapi }: any) => {
  const user = policyContext.state.user;

  if (!user) return false;

  const documentId = policyContext.params?.id;

  if (!documentId) return false;

  const document = await strapi.documents(config.uid).findOne({
    documentId,
    populate: { author: true },
  });

  if (!document?.author) return false;

  return document.author.id === user.id;
};
