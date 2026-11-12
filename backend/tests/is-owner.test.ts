import { describe, expect, it } from 'vitest';
import isOwner from '../src/policies/is-owner';

const UID = 'api::discussion.discussion';

/** Le `strapi` de la policy arrive en argument : un double suffit, sans serveur. */
const strapiWith = (document: unknown) => ({
  documents: () => ({ findOne: async () => document }),
});

const context = (user: unknown, id?: string) => ({
  state: { user },
  params: id === undefined ? {} : { id },
});

const ownedBy = (id: number) => strapiWith({ author: { id } });

describe('policy is-owner', () => {
  it('refuse un visiteur', async () => {
    const allowed = await isOwner(
      context(null, 'doc-1'),
      { uid: UID },
      { strapi: ownedBy(1) },
    );

    expect(allowed).toBe(false);
  });

  it('refuse une route sans identifiant', async () => {
    const allowed = await isOwner(
      context({ id: 1 }),
      { uid: UID },
      { strapi: ownedBy(1) },
    );

    expect(allowed).toBe(false);
  });

  it('refuse un document introuvable', async () => {
    const allowed = await isOwner(
      context({ id: 1 }, 'doc-inconnu'),
      { uid: UID },
      { strapi: strapiWith(null) },
    );

    expect(allowed).toBe(false);
  });

  it("refuse le document d'un autre membre", async () => {
    const allowed = await isOwner(
      context({ id: 2 }, 'doc-1'),
      { uid: UID },
      { strapi: ownedBy(1) },
    );

    expect(allowed).toBe(false);
  });

  it("autorise l'auteur du document", async () => {
    const allowed = await isOwner(
      context({ id: 1 }, 'doc-1'),
      { uid: UID },
      { strapi: ownedBy(1) },
    );

    expect(allowed).toBe(true);
  });
});
