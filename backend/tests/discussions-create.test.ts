import { beforeAll, describe, expect, it } from 'vitest';
import { api, firstCategoryId, loginTwoMembers, postJson, type Session } from './api';

/**
 * Les discussions créées ici restent en base : `delete` n'est accordé à aucun
 * rôle, il n'y a donc pas de nettoyage possible par l'API. Le titre les signale
 * pour qu'on les reconnaisse dans le fil ; `npm run db:reset` les efface.
 */
const TEST_TITLE_PREFIX = '[test] ';

let member: Session;
let otherMember: Session;
let categoryId: string;

beforeAll(async () => {
  [member, otherMember] = await loginTwoMembers();
  categoryId = await firstCategoryId();
});

describe('POST /api/discussions', () => {
  it('refuse un titre de moins de 10 caractères et nomme le champ fautif', async () => {
    const response = await postJson(
      '/api/discussions',
      {
        title: 'Trop cour',
        content: 'Un contenu valide, lui.',
        type: 'question',
        category: categoryId,
      },
      member.jwt,
    );

    expect(response.status).toBe(400);
    expect(response.body.error.details.errors.title).toBe(
      'Le titre doit contenir au moins 10 caractères.',
    );
  });

  it('refuse une création sans jeton', async () => {
    const response = await postJson('/api/discussions', {
      title: `${TEST_TITLE_PREFIX}Création sans jeton d'accès`,
      content: 'Ne devrait jamais être enregistrée.',
      type: 'question',
      category: categoryId,
    });

    expect([401, 403]).toContain(response.status);
  });

  it("ignore l'auteur envoyé par le client et retient celui de la session", async () => {
    const title = `${TEST_TITLE_PREFIX}Auteur imposé par la session ${Date.now()}`;

    const response = await postJson(
      '/api/discussions',
      {
        title,
        content: `Le corps désigne ${otherMember.username} ; la session est celle de ${member.username}.`,
        type: 'discussion',
        category: categoryId,
        author: otherMember.userId,
      },
      member.jwt,
    );

    expect(response.status).toBe(201);
    expect(response.body.data.author.username).toBe(member.username);

    const reread = await api(`/api/discussions/${response.body.data.documentId}`);

    expect(reread.status).toBe(200);
    expect(reread.body.data.title).toBe(title);
    expect(reread.body.data.author.username).toBe(member.username);
  });
});
