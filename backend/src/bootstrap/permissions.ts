import type { Core } from '@strapi/strapi';

const PUBLIC: Record<string, string[]> = {
  category: ['find', 'findOne'],
  discussion: ['find', 'findOne'],
  reply: ['find', 'findOne'],
};

const AUTHENTICATED: Record<string, string[]> = {
  category: ['find', 'findOne'],
  discussion: ['find', 'findOne', 'create'],
  reply: ['find', 'findOne', 'create'],
};

// Permet au frontend d'appeler /api/users/me après connexion.
const AUTHENTICATED_PLUGIN = ['plugin::users-permissions.user.me'];

export default async function setupPermissions(strapi: Core.Strapi) {
  await apply(strapi, 'public', toActions(PUBLIC));
  await apply(strapi, 'authenticated', [...toActions(AUTHENTICATED), ...AUTHENTICATED_PLUGIN]);
}

function toActions(map: Record<string, string[]>) {
  return Object.entries(map).flatMap(([contentType, actions]) =>
    actions.map((action) => `api::${contentType}.${contentType}.${action}`),
  );
}

async function apply(strapi: Core.Strapi, roleType: string, actions: string[]) {
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: roleType } });

  // On échoue bruyamment : sans ce rôle, aucune permission n'est attribuée.
  // Un simple avertissement laisserait src/index.ts poser le drapeau
  // initHasRun et figerait la base en 403 au démarrage suivant.
  if (!role) {
    throw new Error(`Rôle « ${roleType} » introuvable : aucune permission attribuée`);
  }

  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: role.id } });

    if (!existing) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: role.id } });
    }
  }
}
