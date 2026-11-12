/**
 * reply router
 */

import { factories } from '@strapi/strapi';

const isOwner = {
  name: 'global::is-owner',
  config: { uid: 'api::reply.reply' },
};

export default factories.createCoreRouter('api::reply.reply', {
  config: {
    create: {
      policies: ['global::is-authenticated'],
    },
    update: {
      policies: [isOwner],
    },
    delete: {
      policies: [isOwner],
    },
  },
});
