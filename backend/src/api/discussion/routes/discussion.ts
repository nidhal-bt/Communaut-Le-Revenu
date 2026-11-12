/**
 * discussion router
 */

import { factories } from '@strapi/strapi';

const isOwner = {
  name: 'global::is-owner',
  config: { uid: 'api::discussion.discussion' },
};

export default factories.createCoreRouter('api::discussion.discussion', {
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
