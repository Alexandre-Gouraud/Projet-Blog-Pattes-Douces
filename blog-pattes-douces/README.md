<p align="center">
  <img src="public/images/logo.png" alt="Logo Pattes Douces" width="96">
</p>

<h1 align="center">Pattes Douces — référence technique</h1>

<p align="center">
  Architecture, modèle de données, API et choix techniques de l'application.<br>
  Présentation du projet et installation pas à pas : <a href="../README.md"><b>README principal</b></a>.
</p>

---

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Structure du code](#structure-du-code)
- [Modèle de données](#modèle-de-données)
- [API REST](#api-rest)
- [Docker](#docker)
- [Sécurité](#sécurité)
- [Contraintes de versions](#contraintes-de-versions)

---

## Démarrage rapide

```bash
cp .env.example .env

# Option A : pnpm (base MongoDB dans Docker)
pnpm install && pnpm db:up && pnpm db:push && pnpm dev

# Option B : tout dans Docker
docker compose --profile app up -d --build --wait
```

Application sur http://localhost:3000. Prérequis, variables d'environnement et
dépannage : voir le [README principal](../README.md#installation-locale).

## Structure du code

```
src/
├── app/                  Routage uniquement : pages et layouts (Server Components)
│   ├── layout.tsx        Layout racine : <html>, police, métadonnées
│   ├── page.tsx          Accueil
│   ├── error.tsx         Error boundary (Client Component)
│   ├── not-found.tsx     Page 404
│   ├── (auth)/           login, register            -> AppShell
│   ├── (main)/           feed, articles, profile... -> AppShell
│   └── api/              API REST (route handlers)
├── features/             Code métier ("use client"), regroupé par fonctionnalité
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
│   ├── validation.ts     Règles de validation partagées client / serveur
│   ├── http.ts           Lecture sûre du JSON des requêtes, réponses 400
│   ├── reactions.ts      Bascule like / dislike (partagée par les deux routes)
│   ├── routes.ts         Toutes les URL : pages et API
│   ├── api-client.ts     Tous les appels réseau du navigateur
│   └── auth/session.ts   Identité de l'utilisateur courant
├── types/                Types partagés, alignés sur Prisma
└── proxy.ts              Redirige /Feed et /Activity (casse seule) vers les nouvelles URL
```

**Conventions**

- `src/app/` ne contient que du routage ; la logique interactive est dans `src/features/`.
- Dossiers et routes en **anglais**, minuscules, `kebab-case` ; composants en `PascalCase.tsx`.
- Textes affichés en **français**.
- Aucune URL écrite en dur : tout passe par `lib/routes.ts` ; aucun `fetch` hors de `lib/api-client.ts`.
- Les anciennes URL (`/Feed`, `/Connexion`, `/Article_page/:id`...) sont redirigées en 308
  (`next.config.ts` et `src/proxy.ts`).

## Modèle de données

Défini dans [`prisma/schema.prisma`](prisma/schema.prisma). Les noms de champs
sont ceux de la base (en français).

| Modèle | Champs principaux | Remarques |
|---|---|---|
| **User** | `pseudo` (unique), `email` (unique), `password`, `biographie` | `password` est un hash bcrypt, jamais renvoyé par l'API |
| **Article** | `titre`, `texte`, `image`, `date`, `auteurId` | `vue`, `reaction1` (likes), `reaction2` (dislikes) : listes d'id d'utilisateurs |
| **Commentaire** | `texte`, `date`, `article_sourceId`, `commentataireId` | Supprimé avec son article ou avec le compte de son auteur |

Les index uniques sont créés par `pnpm db:push` (service `db-init` sous Docker).

## API REST

Toutes les routes sont des route handlers dans `src/app/api/`.

| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/api/auth/login` | Connexion, renvoie `{ user: { id, pseudo } }` |
| `POST` | `/api/auth/register` | Inscription (pseudo 3-30 caractères, email, mot de passe fort) |
| `GET` `DELETE` | `/api/users/[id]` | Lit (`id`, `pseudo`, `biographie`) ou supprime un compte et tout son contenu |
| `GET` `POST` | `/api/articles` | Liste ou crée un article |
| `GET` `DELETE` | `/api/articles/[id]` | Lit ou supprime un article (et ses commentaires) |
| `POST` | `/api/articles/[id]/views` | Enregistre une vue (une par utilisateur) |
| `POST` | `/api/articles/[id]/like` | Ajoute ou retire un like |
| `POST` | `/api/articles/[id]/dislike` | Ajoute ou retire un dislike |
| `GET` `POST` | `/api/comments` | Liste ou crée un commentaire |
| `POST` | `/api/uploads?filename=` | Téléverse une image vers Vercel Blob |

**Filtres des listes** (appliqués par la base, pas par le navigateur)

| Route | Paramètre | Résultat |
|---|---|---|
| `GET /api/articles` | `?authorId=` | Articles d'un auteur |
| | `?reactedBy=` | Articles likés ou dislikés par un utilisateur |
| `GET /api/comments` | `?articleId=` | Commentaires d'un article |
| | `?commenterId=` | Commentaires écrits par un utilisateur |
| | `?authorId=` | Commentaires reçus sur les articles d'un auteur |

**Codes de réponse** : `400` entrée invalide · `401` identifiants incorrects ·
`404` ressource introuvable · `409` pseudo ou email déjà pris ·
`413` / `415` image trop lourde / format refusé · `503` upload non configuré.
Les erreurs ont la forme `{ "error": "..." }` ou `{ "message": "..." }`.

## Docker

**`Dockerfile`** : build en plusieurs étapes sur `node:24-slim`.

| Étape | Contenu |
|---|---|
| `deps` | Dépendances (`pnpm install --frozen-lockfile`) et client Prisma |
| `builder` | `pnpm build` en mode `standalone` (`NEXT_OUTPUT_STANDALONE=true`) |
| `runner` | Image finale : serveur autonome uniquement, utilisateur non root |

**`compose.yaml`**

| Service | Profil | Rôle |
|---|---|---|
| `mongo` | *(défaut)* | MongoDB 8.0, replica set `rs0` initialisé par le healthcheck |
| `db-init` | `app` | `prisma db push` (index), puis s'arrête |
| `app` | `app` | Application sur le port 3000, healthcheck sur `/api/articles` |

Sans profil (`pnpm db:up`), seule la base démarre. Les ports se changent avec
`MONGO_PORT` et `APP_PORT`. Le jeton `BLOB_READ_WRITE_TOKEN` est lu dans `.env`.

## Sécurité

Ce qui est en place :

- **Aucune donnée sensible exposée** : les réponses ne contiennent jamais le
  hash du mot de passe ni l'email (`publicUserSelect` dans `lib/prisma.ts`).
- **Validation serveur de toutes les entrées** (`lib/validation.ts`) :
  identifiants, longueurs, email, politique de mot de passe, URL d'image.
- **Connexion** : même message et même temps de réponse, que le pseudo existe
  ou non (pas d'énumération des comptes).
- **Upload** : JPEG, PNG, WebP ou GIF uniquement (ni HTML ni SVG), 4 Mo
  maximum, nom de fichier nettoyé, suffixe aléatoire.
- **Intégrité** : suppressions en transaction ; les commentaires orphelins sont
  refusés à la création et ignorés à la lecture.
- **En-têtes HTTP** : `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` ; pas de `X-Powered-By`.
- **Secrets** : `.env*` ignorés par git (racine et application) et exclus de
  l'image Docker.
- **Dépendances** : `pnpm audit`, Dependabot (délai de 7 jours), CodeQL.

> [!WARNING]
> **Limite connue : authentification.** L'identité de l'utilisateur vit dans le
> `localStorage` et n'est jamais vérifiée côté serveur : les routes font
> confiance au `userId` envoyé par le client. N'importe qui peut donc liker,
> commenter, supprimer un article ou un compte à la place d'un autre. À traiter
> dans un chantier dédié (session par cookie `httpOnly`, vérification de
> propriété dans chaque route) ; le module `src/lib/auth/` est prévu pour.

## Contraintes de versions

| Élément | Version | Raison |
|---|---|---|
| **Prisma** | 6.x (`^6.19.3`) | Prisma 7+ exige un driver adapter et aucun adaptateur MongoDB n'est publié. Les majeures sont bloquées dans Dependabot. |
| **deepmerge-ts** | 8.x (override) | Prisma 6 fige la 7.1.5, vulnérable. La 8.x est forcée via `pnpm.overrides` (vérifiée avec `prisma validate` et `generate`). À retirer quand Prisma l'embarquera. |
| **TypeScript** | 6.x | `@typescript-eslint/parser` n'accepte pas TypeScript 7 (`<6.1.0`). |
| **Node.js** | 24 LTS | Version de la CI et de l'image Docker ; les majeures de l'image sont bloquées dans Dependabot. |
| **pnpm** | 10.x | Fixée par `packageManager` dans `package.json`. |
| **MongoDB** | 8.0 | Branche stable à support long. |
