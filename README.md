# Communauté Le Revenu

Un forum de discussion financière. Des membres y posent des questions ou ouvrent des débats dans
des espaces thématiques — épargne, impôts, immobilier… — et se répondent entre eux.

Le site est fait de deux applications séparées, lancées chacune de son côté : un **back-office**
(dans `backend/`) qui stocke le contenu et le met à disposition, et le **site web** (dans
`frontend/`) qui l'affiche. Ce fichier explique comment installer le projet, comment le lancer,
comment il est construit et comment le tester.

> Il n'y a **pas de `package.json` à la racine** : toutes les commandes se lancent depuis
> `backend/` ou depuis `frontend/`.

---

## 1. Installer

Il faut au préalable :

- **Node 22** (le backend accepte `>=20.0.0 <=26.x.x`) ;
- **Docker**, pour la base PostgreSQL — et, au choix, pour tout le projet
  (`docker-compose.yml`, à la racine) ;
- **npm** pour les deux applications. Chacune a son propre `package-lock.json` et son propre
  arbre `node_modules` : les installer séparément, jamais depuis la racine.

```sh
git clone <url-du-depot>
cd "Communauté Le Revenu"

# Variables d'environnement : un fichier par application
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Dépendances : une installation par application
cd backend  && npm install  && cd ..
cd frontend && npm install  && cd ..
```

Les valeurs livrées dans `backend/.env.example` suffisent en local : les secrets y valent
`tobemodified`, et les identifiants de base de données sont ceux que `docker-compose.yml`
lit pour créer le conteneur — les deux fichiers restent donc cohérents sans rien éditer. Pour un
déploiement, remplacer tous les secrets.

Les deux arbres `node_modules` sont séparés et **divergent volontairement sur React** : le backend
reste en React 18, imposé par le panneau d'administration de Strapi, le frontend est en React 19.3.
Ne pas chercher à les aligner.

Le `.env.example` **de la racine** n'est chargé par aucune application : c'est un inventaire
documentaire des variables des deux côtés, décrites par nom, avec leurs valeurs par défaut.

> **À savoir avant le premier démarrage.** Si `backend/.env` est absent, `config/database.ts`
> retombe **silencieusement** sur un fichier SQLite jetable (`backend/.tmp/data.db`) au lieu
> d'échouer. Si le contenu semble « disparaître », vérifier quel client a réellement démarré.

---

## 2. Lancer

### Avec Docker — une seule commande

Tout le projet, base comprise, en trois conteneurs :

```sh
docker compose --env-file backend/.env up -d --build
```

Le `--env-file` n'est pas facultatif : Compose ne charge automatiquement qu'un `.env` posé à
côté du fichier compose, et il n'y en a pas à la racine. `backend/.env` reste donc la source
unique du nom de la base, de l'utilisateur et du mot de passe.

Les services démarrent dans l'ordre, chacun attendant que le précédent soit *healthy* :
`postgres` (sonde `pg_isready`), puis `backend` (sonde `/_health`), puis `frontend`. Le premier
`--build` prend plusieurs minutes : `strapi build` compile le panneau d'administration et
`next build` compile le site.

Ensuite, le contenu de démo, puis l'arrêt :

```sh
docker compose --env-file backend/.env exec backend npm run seed

docker compose --env-file backend/.env down      # arrête, garde les données
docker compose --env-file backend/.env down -v   # arrête et détruit le volume PostgreSQL
```

Deux pièges à connaître :

- `/admin` demande toujours de créer le premier administrateur à la main. Le seed crée des
  **membres**, pas des administrateurs.
- `NEXT_PUBLIC_STRAPI_URL` est **figée dans le bundle au moment du build** de l'image frontend :
  c'est l'URL que le navigateur appelle (`http://localhost:1337`). Le rendu serveur, lui, passe
  par `STRAPI_INTERNAL_URL` (`http://backend:1337`), injectée au démarrage par Compose, parce
  qu'un conteneur ne joint pas Strapi sur son propre `localhost`. Changer `BACKEND_PORT` impose
  donc un `up --build`, pas un simple `up`.

### En local, sans Docker

Trois terminaux, dans cet ordre :

```sh
# 1 — base de données puis API (db:up attend le healthcheck, puis lance strapi develop)
cd backend && npm run dev

# 2 — le contenu de démo, une fois l'API démarrée
cd backend && npm run seed

# 3 — le site
cd frontend && npm run dev
```

Dans ce mode, du fichier compose on ne lance que le service `postgres`, et jamais à la main :
les scripts `db:*` de `backend/package.json` le pilotent, en lui passant `backend/.env` par
`--env-file` — c'est de là que viennent le nom de la base, l'utilisateur et le mot de passe.
`npm run db:up` et `npm run db:down` nomment explicitement `postgres`, donc ils ne touchent
jamais aux conteneurs `backend` et `frontend`. `npm run db:config` affiche la configuration
résolue sans rien démarrer, pour vérifier que ces valeurs sont bien lues.

### Adresses

| | URL |
|---|---|
| Site | `http://localhost:3000` |
| API REST | `http://localhost:1337/api` |
| Administration Strapi | `http://localhost:1337/admin` |

Le backend écoute sur `0.0.0.0` par défaut, donc l'API est aussi joignable depuis le réseau local,
pas seulement en `localhost`.

Le compte créé au premier passage sur `/admin` est un compte **d'administration**, stocké à part
des membres de l'API. Créer l'un ne crée pas l'autre, et `/api/users/me` ne renvoie jamais un
administrateur.

### Comptes de démo

Les huit comptes semés par `npm run seed` partagent le même mot de passe, `Password123!`, défini
dans `backend/scripts/seeders/users.ts`.

| Membre | Identifiant |
|---|---|
| Vincent | `vincent@demo.fr` |
| Odile | `odile@demo.fr` |
| Camille | `camille@demo.fr` |
| Karim | `karim@demo.fr` |
| Nadia | `nadia@demo.fr` |
| Thomas | `thomas@demo.fr` |
| Julie | `julie@demo.fr` |
| Bruno | `bruno@demo.fr` |

C'est un mot de passe de développement, en clair dans le dépôt : ne jamais semer ces comptes sur
une base partagée ou exposée.

Le seed est **idempotent** — il court-circuite tout compte déjà présent, ce qui a une conséquence :
si le mot de passe d'un compte a été changé à la main, le relancer ne le remet pas en place. Pour
repartir d'une base propre, `npm run db:reset` (qui détruit le volume PostgreSQL) puis
`npm run seed`.

---

## 3. Architecture

| | `backend/` | `frontend/` |
|---|---|---|
| Stack | Strapi 5.60, TypeScript, Koa | Next.js 16.4, React 19.3, TypeScript |
| Données | PostgreSQL 17 (conteneur Docker) | — |
| Style | — | Tailwind CSS v4, primitives shadcn |
| Gestionnaire | **npm** (`package-lock.json`) | **npm** (`package-lock.json`) |
| Tests | Vitest (HTTP, sur serveur lancé) | Vitest + Testing Library (jsdom) |

Le modèle de contenu tient en trois types :

```
Category 1──n Discussion n──1 User (auteur)
                   │
                   └──n Reply n──1 User (auteur)
```

L'identité visuelle est dérivée de la maquette HTML fournie avec l'énoncé, qui sert de référence de
design et n'est jamais modifiée — elle n'est pas versionnée ici. Les décisions ci-dessous sont
résumées ; le détail d'implémentation est commenté dans le code, à l'endroit qu'il concerne.

### Backend

- **L'auteur vient du jeton, jamais du corps.** Les contrôleurs `create` posent
  `author: ctx.state.user.id` et ignorent tout `author` reçu du client, donc personne ne peut
  publier au nom d'un autre membre. C'est le troisième test de la suite qui le prouve.
- **Les permissions sont semées depuis le code**, pas cochées dans l'admin : Strapi les garde en
  base dans `up_permissions`, qu'aucun fichier ne suit, et `src/bootstrap/permissions.ts` les
  attribue au premier démarrage. Corollaire : éditer ce fichier n'a aucun effet sur une base déjà
  initialisée.
- **`update` et `delete` sont fermés à double tour.** Aucun rôle ne les reçoit, ils répondent donc
  403 ; et la policy `global::is-owner` les garde malgré tout, en relisant l'auteur du document pour
  refuser quiconque n'est pas lui. C'est ce qui évite qu'une case cochée dans `/admin` n'ouvre la
  modification du contenu d'autrui. Le type de contenu vient de la configuration de la route, de
  sorte qu'une seule policy serve les discussions et les réponses.
- **La validation vit dans Strapi**, indépendamment du front : longueurs, type, existence de
  l'espace, avec des messages **en français** sous `error.details.errors`, champ par champ. Le
  frontend les relaie tels quels.
- **Les listes ne chargent que ce qu'une carte affiche**, le détail charge le reste. Les
  contrôleurs délèguent à `super.find` / `super.findOne` — ce qui préserve `filters`, `sort` et
  `pagination` — puis rattachent l'auteur eux-mêmes, réduit à `{ documentId, username }`
  (`src/utils/attach-authors.ts`), parce que le *sanitizer* de Strapi retire la relation et que
  l'accorder ouvrirait `/api/users`. Ni e-mail ni mot de passe ne peuvent donc fuir.
- **`replyCount` est dénormalisé**, tenu par les lifecycles de la réponse en SQL et dans une
  transaction, pour que l'onglet « Tendances » trie sans une jointure par ligne.
  `scripts/seeders/reply-counts.ts` recalcule le compteur en cas de dérive.
- **Deux points du contrat à connaître avant d'appeler l'API.** `strictParams` est actif : un
  paramètre inconnu part en **400**, il n'est pas ignoré. Et l'authentification est en
  `jwtManagement: 'refresh'` : le JWT vaut **10 minutes**, le jeton de rotation est opaque et posé
  en cookie `httpOnly` — jamais dans le JSON. Un 401 est le cas normal, pas une anomalie.

### Frontend

- **Serveur par défaut, client seulement où il y a de l'interaction** : une vingtaine de fichiers
  `"use client"`, qui sont exactement les surfaces interactives. Les lectures de données et la
  session restent côté serveur, et chaque lecture non pré-rendable vit sous sa propre frontière
  `<Suspense>`.
- **Les appels à Strapi sont centralisés et typés** dans `src/lib/strapi/` (origine, sérialisation
  des paramètres, client, puis un module par ressource) avec les types dans `src/types/` : aucun
  composant ne construit une URL d'API à la main.
- **Deux clients, séparés exprès** : `strapiFetch` pour les lectures publiques, mises en cache ;
  `authenticatedFetch` pour tout appel en tant que membre. Ce second est le seul endroit qui gère
  l'expiration — sur 401 il échange le jeton de rotation, réécrit la session entière, puis rejoue
  la requête **une** fois. Les fusionner inviterait à poser un `POST` dans une portée de cache.
- **La session est un cookie `httpOnly` écrit par une Server Action** (`src/lib/auth/`) : le mot de
  passe ne quitte pas notre origine et le JWT n'atteint jamais le navigateur.
- **Le tri, les filtres et la page sont dans l'URL** (`?tab=`, `?page=`), seule source de vérité :
  `src/lib/feed-tabs.ts` les traduit en requête Strapi, `src/lib/feed-url.ts` fabrique les
  adresses. L'état est partageable et rechargeable, sans état client à synchroniser.
- **Une lecture échouée et une liste vide ne se confondent jamais.** Un backend éteint ferait dire
  « aucune discussion » à une recherche ; les lectures concernées renvoient donc explicitement
  `{ failed: true }`, décidé **en dehors** de la portée mise en cache, sinon la panne serait mise
  en cache avec le reste.

### Bibliothèques ajoutées, et pourquoi

| Bibliothèque | Raison |
|---|---|
| `qs` | Écrit la notation crochets de Strapi 5 (`filters[category][slug][$eq]`) sans cas particulier par champ, et n'émet rien pour une clé absente — indispensable avec `strictParams`. |
| `@base-ui/react`, `class-variance-authority`, `cn` | Les primitives accessibles derrière les composants shadcn (dialogue, champs, boutons), sans adopter un framework UI complet. |
| `lucide-react` | Les icônes que le backend stocke **par nom** dans `Category.icon` : la base nomme l'icône, le front la résout. |
| `sonner` | Les confirmations après publication d'une discussion ou d'une réponse. |
| `server-only` | Barrière de build sur les modules de session et d'authentification : les importer depuis un composant client échoue à la compilation, pas à l'exécution. |
| `tw-animate-css` | Les animations d'entrée et de sortie attendues par les composants shadcn. |

Ce qui n'a **pas** été ajouté est tout aussi délibéré : aucune bibliothèque de gestion d'état, de
récupération de données ou de formulaires. Les Server Actions couvrent les écritures,
`searchParams` couvre l'état partageable, et Tailwind v4 se configure en CSS
(`src/app/globals.css`) sans fichier de configuration JavaScript.

---

## 4. Tests

```sh
cd backend  && npm test     # Vitest, appels HTTP
cd frontend && npm test     # Vitest + Testing Library, jsdom
```

### Backend — `tests/discussions-create.test.ts`

Trois cas sur `POST /api/discussions`, qui couvrent la chaîne entière plutôt qu'une fonction
isolée :

1. un titre de moins de 10 caractères est refusé en **400**, et la réponse **nomme le champ
   fautif** avec le message français du contrôleur ;
2. une création **sans jeton** est refusée (401 ou 403) ;
3. un `author` envoyé dans le corps est **ignoré** : la discussion est attribuée à l'auteur de la
   session, vérifié à la création puis sur une relecture en `GET`.

**La suite ne démarre aucun serveur.** Elle parle en HTTP à un Strapi déjà lancé, base semée
comprise (`TEST_API_URL`, défaut `http://localhost:1337`, et `TEST_SEED_PASSWORD`). Sans serveur,
tout échoue en `ECONNREFUSED` ; sans seed, sur un message explicite. C'est un choix : `create`
n'est juste que comme chaîne complète — politique de route, permissions en base, sanitizer,
contrôleur — et un Strapi démarré en mémoire sur SQLite n'en testerait aucun maillon tel qu'il est
configuré.

Deux conséquences : la suite **écrit dans la base de développement sans pouvoir nettoyer**
(`delete` n'est accordé à aucun rôle), d'où le préfixe `[test]` sur les titres créés et
`npm run db:reset` comme seule purge ; et comme éditer un fichier de `backend/` redémarre
`strapi develop`, il faut laisser le serveur revenir avant de relancer les tests.

### Backend — `tests/is-owner.test.ts`

L'exception : la policy reçoit `strapi` en argument, donc un double suffit et les cinq cas —
visiteur, route sans identifiant, document introuvable, document d'un autre membre, auteur —
tournent **sans serveur ni base semée**.

### Frontend — quatre fichiers

`src/components/feed/feed-list.test.tsx` : le fil affiche bien titres, auteurs et compteurs de
réponses, dans ses **deux vues** (détaillée et compacte), y compris le compteur à zéro ; et une
liste vide donne l'état vide ou la carte de panne selon `failed`, puisque les deux arrivent avec
exactement les mêmes données.

Trois suites unitaires couvrent ensuite les fonctions pures dont le reste dépend :
`src/lib/discussion-slug.test.ts` (l'adresse d'une discussion, et le retour au `documentId`),
`src/lib/feed-url.test.ts` (les pages refusées, les paramètres à leur valeur par défaut qui ne
s'écrivent pas) et `src/lib/feed-tabs.test.ts` (le tri de chaque onglet, et le filtre d'espace qui
s'**ajoute** à celui de l'onglet au lieu de le remplacer).
