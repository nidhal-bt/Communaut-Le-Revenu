import type { Core } from '@strapi/strapi';
import setupPermissions from './bootstrap/permissions';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const store = setupStore(strapi);
    if (await store.get({ key: 'initHasRun' })) return;

    // Le drapeau n'est posé qu'après coup : si l'attribution échoue, le
    // prochain démarrage réessaie au lieu de laisser une base en 403.
    await setupPermissions(strapi);
    await store.set({ key: 'initHasRun', value: true });

    strapi.log.info('Permissions des rôles configurées');
  },
};

function setupStore(strapi: Core.Strapi) {
  return strapi.store({
    environment: strapi.config.environment,
    type: 'core',
    name: 'setup',
  });
}
