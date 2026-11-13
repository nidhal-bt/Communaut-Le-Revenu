/**
 * Appels HTTP contre un serveur déjà lancé — il n'y a pas de harnais Strapi ici.
 *
 * Les tests parlent au `strapi develop` de la machine, base semée comprise :
 * c'est le seul moyen d'exercer la chaîne réelle (politique de route,
 * permissions en base, sanitizer, contrôleur) telle que le frontend la voit.
 */

const BASE_URL = process.env.TEST_API_URL ?? 'http://localhost:1337';

/** Mot de passe partagé des comptes de démonstration, porté par `data/users.json`. */
const SEED_PASSWORD = process.env.TEST_SEED_PASSWORD ?? 'password';

const DEMO_EMAILS = [
  'vincent@demo.fr',
  'odile@demo.fr',
  'camille@demo.fr',
  'karim@demo.fr',
  'nadia@demo.fr',
  'thomas@demo.fr',
  'julie@demo.fr',
  'bruno@demo.fr',
];

export type ApiResponse<T> = {
  status: number;
  body: T;
};

export const api = async <T = any>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${BASE_URL}${path}`, init);
  const text = await response.text();

  return {
    status: response.status,
    body: (text ? JSON.parse(text) : null) as T,
  };
};

export const postJson = <T = any>(
  path: string,
  data: unknown,
  token?: string,
): Promise<ApiResponse<T>> =>
  api<T>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data }),
  });

export type Session = {
  jwt: string;
  userId: number;
  username: string;
};

const tryLogin = async (email: string): Promise<Session | null> => {
  const response = await api<{ jwt: string; user: { id: number; username: string } }>(
    '/api/auth/local',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password: SEED_PASSWORD }),
    },
  );

  if (response.status !== 200) return null;

  return {
    jwt: response.body.jwt,
    userId: response.body.user.id,
    username: response.body.user.username,
  };
};

/**
 * Deux membres distincts, pour opposer l'auteur de la session à celui du corps.
 *
 * On ne nomme pas les comptes : dans une base déjà vécue, tous ne répondent
 * plus au mot de passe du seed (un mot de passe changé invalide le hachage
 * d'origine, et le seeder court-circuite les comptes existants, donc il ne le
 * répare pas). On prend les deux premiers qui répondent.
 */
export const loginTwoMembers = async (): Promise<[Session, Session]> => {
  const sessions: Session[] = [];

  for (const email of DEMO_EMAILS) {
    const session = await tryLogin(email);

    if (session) sessions.push(session);
    if (sessions.length === 2) return [sessions[0], sessions[1]];
  }

  throw new Error(
    'Moins de deux comptes de démonstration acceptent le mot de passe du seed. ' +
      'Le serveur tourne-t-il, et la base est-elle semée (`npm run seed`) ?',
  );
};

export const firstCategoryId = async (): Promise<string> => {
  const response = await api<{ data: { documentId: string }[] }>('/api/categories');

  if (response.status !== 200 || !response.body.data?.length) {
    throw new Error(
      'Aucun espace lisible sur /api/categories : lancez `npm run seed` avant les tests.',
    );
  }

  return response.body.data[0].documentId;
};
