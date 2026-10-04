# Blog Pattes Douces

Blog communautaire : publication d'articles, fil d'actualite, reactions (vues,
likes, dislikes) et commentaires.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Heroicons |
| Base de donnees | MongoDB via Prisma 6 |
| Stockage d'images | Vercel Blob |
| Runtime | Node.js 24 LTS |
| Gestionnaire de paquets | pnpm 10 (version fixee par `packageManager`) |

> **Prisma est volontairement limite a la 6.x** (`^6.19.3`). Prisma 7 exige un
> driver adapter et aucun adaptateur MongoDB n'est publie : l'application ne
> pourrait plus se connecter a la base. Ne pas le monter en version sans changer
> de base. Les majeures de Prisma sont aussi ignorees par `.github/dependabot.yml`.

> **Override `deepmerge-ts` (`pnpm.overrides` dans `package.json`).** Prisma 6
> fige `deepmerge-ts` en 7.1.5, vulnerable (GHSA stack exhaustion). La 8.x est
> forcee : `prisma validate` et `prisma generate` ont ete verifies avec. A
> retirer si Prisma 6 publie une version qui l'embarque.

> **TypeScript est volontairement en 6.x.** `typescript-eslint` ne supporte pas
> encore TypeScript 7, ce qui fait echouer `pnpm lint` au demarrage. C'est aussi
> ce que documente le garde-fou `typescript` de `.github/dependabot.yml`.

## Demarrage

### Prerequis

| Outil | Version | Verifier |
|---|---|---|
| Node.js | 24 LTS | `node -v` |
| pnpm | 10 (fixee par `packageManager`) | `corepack enable` puis `pnpm -v` |
| Docker | avec `docker compose` | `docker compose version` |

Docker ne sert qu'a la base locale. Avec une base MongoDB Atlas, il est inutile.

### Installation (5 etapes)

```bash
# 1. Dependances (genere aussi le client Prisma)
pnpm install

# 2. Variables d'environnement : copier le modele (.env n'est jamais commite)
cp .env.example .env

# 3. Base MongoDB locale en replica set (attend qu'elle soit prete)
pnpm db:up

# 4. Cree les index (pseudo et email uniques) dans la base
pnpm db:push

# 5. Serveur de developpement
pnpm dev
```

L'application demarre sur http://localhost:3000. Creer un compte via
**Se connecter > Inscris-toi**.

> **Pourquoi un replica set ?** Prisma utilise des transactions pour ecrire dans
> MongoDB. Sur un `mongod` lance seul, toute ecriture (inscription, article...)
> echoue avec *"Prisma needs to perform transactions, which requires your
> MongoDB server to be run as a replica set"*. Le `compose.yaml` fourni lance
> MongoDB 8.0 en replica set et l'initialise automatiquement.

### Variables d'environnement

| Variable | Obligatoire | Role |
|---|---|---|
| `DATABASE_URL` | oui | Chaine de connexion MongoDB (replica set) utilisee par Prisma |
| `BLOB_READ_WRITE_TOKEN` | pour publier | Jeton Vercel Blob (Storage > Blob > Tokens). Sans lui, tout fonctionne sauf la publication d'un article (l'image est obligatoire) |

Le modele commente est dans [`.env.example`](.env.example). Les fichiers `.env`
et `.env.*` sont ignores par git (seul `.env.example` est versionne).

### Problemes frequents

| Symptome | Cause / solution |
|---|---|
| `requires your MongoDB server to be run as a replica set` | `DATABASE_URL` pointe vers un MongoDB sans replica set : utiliser `pnpm db:up` et l'URL de `.env.example` |
| `pnpm db:up` : port 27017 deja utilise | Un autre MongoDB tourne : `MONGO_PORT=27019 pnpm db:up` et mettre `localhost:27019` dans `DATABASE_URL` |
| `pnpm db:push` oublie | Aucune erreur visible, mais la base ne garantit plus l'unicite du pseudo et de l'email : le lancer apres chaque base neuve |
| Publication d'article : « L'upload d'images n'est pas configuré » | Renseigner `BLOB_READ_WRITE_TOKEN` |
| `Another next dev server is already running` | Un `pnpm dev` tourne deja dans ce dossier : utiliser son URL ou l'arreter |

### Scripts

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de developpement |
| `pnpm build` | Build de production (inclut la verification TypeScript) |
| `pnpm start` | Sert le build de production |
| `pnpm lint` | ESLint (plugin Next + regles des hooks React) |
| `pnpm typecheck` | Genere les types de routes puis lance `tsc --noEmit` |
| `pnpm db:up` | Demarre MongoDB (replica set) via `docker compose` |
| `pnpm db:push` | Synchronise les index de la base avec `prisma/schema.prisma` |
| `pnpm db:down` | Arrete MongoDB (les donnees restent dans le volume Docker) |

## Structure

```
src/
├── app/                  Routage uniquement : pages et layouts en Server Components
│   ├── error.tsx         Error boundary (Client Component)
│   ├── not-found.tsx     Page 404
│   ├── (auth)/           login, register            -> AppShell
│   ├── (main)/           feed, articles, profile... -> AppShell
│   └── api/              API REST (route handlers)
├── features/             Code metier ("use client"), groupe par fonctionnalite
│   ├── auth/             LoginForm, RegisterForm
│   ├── articles/         ArticleFeed, ArticleDetail, ArticleForm, MyArticlesList, events.ts
│   ├── comments/         CommentList
│   ├── dashboard/        StatsOverview, StatsChart, hooks/useUserStats.ts
│   ├── profile/          ProfileView
│   └── activity/         ActivityList
├── components/
│   └── layout/           AppShell, Header, Sidebar, Footer, Navbar, Banner
├── lib/
│   ├── prisma.ts         Singleton Prisma + publicUserSelect (champs utilisateur exposables)
│   ├── validation.ts     Regles de validation partagees client / serveur
│   ├── http.ts           Lecture sure du JSON des requetes, reponses 400
│   ├── reactions.ts      Bascule like / dislike (partage par les deux routes)
│   ├── routes.ts         Toutes les URL, pages et API
│   ├── api-client.ts     Tous les appels reseau
│   └── auth/session.ts   Identite de l'utilisateur courant
├── types/                Types partages, alignes sur Prisma
└── proxy.ts              Redirige /Feed et /Activity (casse seule) vers les nouvelles URL
```

Conventions : dossiers et routes en **anglais**, en minuscules et en
`kebab-case` ; composants en `PascalCase.tsx` ; textes affiches en **francais**.

## API

| Methode | Route | Role |
|---|---|---|
| `POST` | `/api/auth/login` | Connexion, renvoie `{ user: { id, pseudo } }` |
| `POST` | `/api/auth/register` | Inscription (pseudo 3-30 car., email, mot de passe fort) |
| `GET` `DELETE` | `/api/users/[id]` | Lit (`id`, `pseudo`, `biographie`) ou supprime un compte et tout son contenu |
| `GET` `POST` | `/api/articles` | Liste (filtres `?authorId=`, `?reactedBy=`) ou cree un article |
| `GET` `DELETE` | `/api/articles/[id]` | Lit ou supprime un article (et ses commentaires) |
| `POST` | `/api/articles/[id]/views` | Enregistre une vue (une par utilisateur) |
| `POST` | `/api/articles/[id]/like` | Bascule un like |
| `POST` | `/api/articles/[id]/dislike` | Bascule un dislike |
| `GET` `POST` | `/api/comments` | Liste (filtres `?articleId=`, `?commenterId=`, `?authorId=`) ou cree un commentaire |
| `POST` | `/api/uploads?filename=` | Televerse une image (JPEG, PNG, WebP, GIF, 4 Mo max) vers Vercel Blob |

Les anciennes URL de pages sont redirigees en 308 (voir `next.config.ts`).

## Securite

Ce qui est en place :

- **Aucune donnee sensible exposee** : les reponses ne contiennent jamais le
  hash du mot de passe ni l'email (`publicUserSelect` dans `lib/prisma.ts`).
- **Validation serveur de toutes les entrees** (`lib/validation.ts`) :
  identifiants, longueurs, email, politique de mot de passe, URL d'image. Une
  entree invalide renvoie 400/404, jamais 500.
- **Connexion** : meme message et meme temps de reponse que le pseudo existe ou
  non (pas d'enumeration des comptes).
- **Upload** : types d'image limites (pas de HTML ni de SVG), 4 Mo max, nom de
  fichier nettoye, suffixe aleatoire.
- **En-tetes HTTP** : `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` ; pas de `X-Powered-By`.
- **Secrets** : `.env*` ignores par git a la racine et dans l'application.
- **Dependances** : `pnpm audit`, Dependabot (avec delai de 7 jours) et CodeQL.

## Limite connue : authentification

L'identite de l'utilisateur vit dans le `localStorage` et **n'est jamais
verifiee cote serveur** : les routes font confiance au `userId` envoye par le
client. N'importe qui peut donc liker, commenter, supprimer un article ou un
compte a la place d'un autre. A traiter dans un chantier dedie (session par
cookie `httpOnly`, verification de propriete dans chaque route). Le module
`src/lib/auth/` est en place pour accueillir ce changement.

## Licence

MIT.
