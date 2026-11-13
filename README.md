# Communauté Le Revenu

Forum de discussion financière : les membres ouvrent des questions ou des débats dans des espaces
thématiques et se répondent entre eux. Deux applications indépendantes, **`backend/`** (Strapi 5.60,
TypeScript, PostgreSQL 17) et **`frontend/`** (Next.js 16.4, React 19.3, TypeScript, Tailwind v4).
Pas de `package.json` à la racine : toutes les commandes se lancent depuis l'un ou l'autre dossier.

## 1. Installation

Prérequis : **Node 22**, **Docker**, **npm**.

```sh
git clone <url-du-depot>
cd "Communauté Le Revenu"

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

cd backend  && npm install  && cd ..
cd frontend && npm install  && cd ..
```

Les valeurs des `.env.example` suffisent en local : les secrets valent `tobemodified` et les
identifiants de base sont ceux que `docker-compose.yml` utilise pour créer le conteneur.

## 2. Lancement

Tout le projet avec Docker :

```sh
docker compose --env-file backend/.env up -d --build
docker compose --env-file backend/.env exec backend npm run seed
```

Le `--env-file` n'est pas facultatif : il n'y a pas de `.env` à côté du fichier compose, donc
`backend/.env` est la source unique des identifiants de base. `down` arrête en gardant les données,
`down -v` détruit le volume.

Ou en local, trois terminaux dans cet ordre — seul `postgres` tourne alors sous Docker, lancé par
`npm run dev` :

```sh
cd backend  && npm run dev    # PostgreSQL puis strapi develop
cd backend  && npm run seed   # contenu de démo, une fois l'API démarrée
cd frontend && npm run dev
```

Site `http://localhost:3000` · API `http://localhost:1337/api` · admin `http://localhost:1337/admin`.
`/admin` demande de créer le premier administrateur à la main : les comptes d'administration sont
stockés à part des membres, et le seed ne crée que des membres.

Les huit membres semés — `vincent`, `odile`, `camille`, `karim`, `nadia`, `thomas`, `julie`, `bruno`,
tous en `@demo.fr` — partagent le mot de passe de développement `password`. Le seed est
idempotent ; pour repartir à zéro, `npm run db:reset` puis `npm run seed`.

## 3. Architecture

```
Category 1──n Discussion n──1 User (auteur)
                   │
                   └──n Reply n──1 User (auteur)
```

L'identité visuelle est dérivée de la maquette HTML fournie avec l'énoncé, jamais modifiée.

**Backend.** L'auteur vient du jeton, jamais du corps : les contrôleurs `create` posent
`author: ctx.state.user.id` et ignorent tout `author` reçu du client. Les permissions sont semées
depuis le code (`src/bootstrap/permissions.ts`), Strapi les gardant en base sans qu'aucun fichier ne
les suive ; `update` et `delete` ne sont accordés à aucun rôle, et la policy `global::is-owner` relit
l'auteur du document pour refuser quiconque n'est pas lui, le type de contenu venant de la route.
La validation vit dans Strapi, indépendamment du front, en français et champ par champ sous
`error.details.errors`. Les listes ne chargent que ce qu'une carte affiche : les contrôleurs
délèguent à `super.find` / `super.findOne` — ce qui préserve `filters`, `sort` et `pagination` — puis
rattachent l'auteur réduit à `{ documentId, username }`, parce que le *sanitizer* retire la relation
et que l'accorder ouvrirait `/api/users` ; `replyCount` est dénormalisé par les lifecycles de la
réponse, pour trier sans jointure par ligne. Deux points du contrat : `strictParams` renvoie **400**
sur un paramètre inconnu, et `jwtManagement: 'refresh'` donne un JWT de 10 minutes plus un jeton de
rotation opaque en cookie `httpOnly`.

**Frontend.** Serveur par défaut, client seulement où il y a de l'interaction, chaque lecture non
pré-rendable sous sa propre frontière `<Suspense>`. Les appels à Strapi sont centralisés et typés
dans `src/lib/strapi/`, types dans `src/types/` : aucun composant ne construit une URL d'API. Deux
clients séparés — `strapiFetch` pour les lectures publiques mises en cache, `authenticatedFetch` pour
les appels en tant que membre, seul endroit qui gère l'expiration (sur 401 : échange du jeton de
rotation, réécriture de la session, une seule nouvelle tentative) ; la session est un cookie
`httpOnly` écrit par une Server Action, donc le mot de passe ne quitte pas notre origine et le JWT
n'atteint jamais le navigateur. Le tri, les filtres et la page sont dans l'URL (`?tab=`, `?page=`),
seule source de vérité. Une lecture échouée et une liste vide ne se confondent jamais : les lectures
renvoient explicitement `{ failed: true }`, décidé en dehors de la portée mise en cache.

**Bibliothèques ajoutées.** `qs` (notation crochets de Strapi 5, et rien pour une clé absente —
indispensable avec `strictParams`) · `@base-ui/react`, `class-variance-authority`, `cn` (primitives
accessibles derrière les composants shadcn) · `lucide-react` (icônes que le backend stocke par nom
dans `Category.icon`) · `sonner` (confirmations de publication) · `server-only` (barrière de build
sur les modules de session) · `tw-animate-css` (animations attendues par shadcn). Rien pour l'état,
la récupération de données ou les formulaires : les Server Actions couvrent les écritures,
`searchParams` l'état partageable, et Tailwind v4 se configure en CSS.

## 4. Tests

```sh
cd backend  && npm test     # Vitest, appels HTTP
cd frontend && npm test     # Vitest + Testing Library, jsdom
```

`tests/discussions-create.test.ts` couvre `POST /api/discussions` de bout en bout : titre trop court
refusé en 400 avec le champ fautif nommé, création sans jeton refusée, `author` du corps ignoré au
profit de l'auteur de la session ; `tests/is-owner.test.ts` couvre les cinq cas de la policy
d'appartenance. Côté frontend, `feed-list.test.tsx` vérifie le fil dans ses deux vues (titres,
auteurs, compteurs, état vide contre carte de panne), et trois suites unitaires couvrent
`discussion-slug`, `feed-url` et `feed-tabs`.

La suite backend **ne démarre aucun serveur** : elle parle en HTTP à un Strapi déjà lancé et semé
(`TEST_API_URL`, `TEST_SEED_PASSWORD`), parce que `create` n'est juste que comme chaîne complète —
route, permissions, sanitizer, contrôleur. Elle écrit dans la base de développement sans pouvoir
nettoyer, d'où le préfixe `[test]` sur les titres créés et `npm run db:reset` comme purge.
