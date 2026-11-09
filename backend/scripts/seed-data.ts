import { createStrapi, compileStrapi } from '@strapi/strapi';
import seedCategories from './seeders/categories';
import seedUsers from './seeders/users';
import seedDiscussions from './seeders/discussions';
import seedReplies from './seeders/replies';
import seedReplyCounts from './seeders/reply-counts';

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';

  try {
    const categories = await seedCategories(app);
    const users = await seedUsers(app);
    const discussions = await seedDiscussions(app, categories, users);
    await seedReplies(app, discussions, users);
    await seedReplyCounts(app);

    console.log('\nDonnées de démonstration prêtes.');
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
