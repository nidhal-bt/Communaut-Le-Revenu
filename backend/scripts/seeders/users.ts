import type { Core } from '@strapi/strapi';
import readData from './read-data';

type User = { username: string; email: string; password: string };

export default async function seedUsers(strapi: Core.Strapi) {
  const items = await readData<User>(strapi, 'users.json');

  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });

  if (!role) {
    throw new Error('Rôle « authenticated » introuvable : la base est-elle initialisée ?');
  }

  const result = [];

  for (const data of items) {
    const existing = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { email: data.email } });

    if (existing) {
      result.push(existing);
      continue;
    }

    // Passe par le service du plugin pour que le mot de passe soit haché
    // et le rôle attribué correctement.
    result.push(
      await strapi.plugin('users-permissions').service('user').add({
        ...data,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      }),
    );
  }

  console.log(`Utilisateurs : ${result.length} (mot de passe : voir data/users.json)`);
  return result;
}