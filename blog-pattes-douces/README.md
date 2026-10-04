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
| Gestionnaire de paquets | pnpm |

> **Prisma est volontairement fige en 6.19.3.** Prisma 7 exige un driver adapter
> et aucun adaptateur MongoDB n'est publie : l'application ne pourrait plus se
> connecter a la base. Ne pas le monter en version sans changer de base.

> **TypeScript est volontairement en 6.x.** `typescript-eslint` ne supporte pas
> encore TypeScript 7, ce qui fait echouer `pnpm lint` au demarrage. C'est aussi
> ce que documente le garde-fou `typescript` de `.github/dependabot.yml`.

## Demarrage

```bash
pnpm install
cp .env.example .env        # puis renseigner les variables
pnpm exec prisma generate   # lance aussi automatiquement au pnpm install
pnpm dev
```

L'application demarre sur http://localhost:3000.

### Variables d'environnement

| Variable | Role |
|---|---|
| `DATABASE_URL` | Chaine de connexion MongoDB utilisee par Prisma |
| `BLOB_READ_WRITE_TOKEN` | Jeton Vercel Blob pour l'upload des images d'article |

### Scripts

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de developpement |
| `pnpm build` | Build de production (inclut la verification TypeScript) |
| `pnpm start` | Sert le build de production |
| `pnpm lint` | ESLint (plugin Next + regles des hooks React) |

## Structure

```
src/
├── app/                  Routage uniquement : pages et layouts en Server Components
│   ├── (auth)/           login, register            -> AppShell
│   ├── (main)/           feed, articles, profile... -> AppShell
│   └── api/              API REST (route handlers)
├── features/             Code metier ("use client"), groupe par fonctionnalite
│   ├── auth/             LoginForm, RegisterForm
│   ├── articles/         ArticleFeed, ArticleDetail, ArticleForm, MyArticlesList
│   ├── comments/         CommentList
│   ├── dashboard/        StatsOverview, StatsChart
│   ├── profile/          ProfileView
│   └── activity/         ActivityList
├── components/
│   ├── layout/           AppShell, Header, Sidebar, Footer, Navbar, Banner
│   └── ui/               Briques reutilisables
├── context/              SidebarContext
├── lib/
│   ├── prisma.ts         Singleton Prisma (seule instanciation du projet)
│   ├── routes.ts         Toutes les URL, pages et API
│   ├── api-client.ts     Tous les appels reseau
│   └── auth/session.ts   Identite de l'utilisateur courant
└── types/                Types partages, alignes sur Prisma
```

Conventions : dossiers et routes en **anglais**, en minuscules et en
`kebab-case` ; composants en `PascalCase.tsx` ; textes affiches en **francais**.

## API

| Methode | Route | Role |
|---|---|---|
| `POST` | `/api/auth/login` | Connexion, renvoie `{ user: { id, pseudo } }` |
| `POST` | `/api/auth/register` | Inscription |
| `GET` | `/api/users?pseudo=` | Recherche un utilisateur par pseudo |
| `GET` `DELETE` | `/api/users/[id]` | Lit ou supprime un compte |
| `GET` `POST` | `/api/articles` | Liste (filtre `?authorId=`) ou cree un article |
| `GET` `DELETE` | `/api/articles/[id]` | Lit ou supprime un article |
| `POST` | `/api/articles/[id]/views` | Enregistre une vue |
| `POST` | `/api/articles/[id]/like` | Bascule un like |
| `POST` | `/api/articles/[id]/dislike` | Bascule un dislike |
| `GET` `POST` | `/api/comments` | Liste (filtre `?articleId=`) ou cree un commentaire |
| `POST` | `/api/uploads?filename=` | Televerse une image vers Vercel Blob |

Les anciennes URL de pages sont redirigees en 308 (voir `next.config.ts`).

## Limite connue : authentification

L'identite de l'utilisateur vit dans le `localStorage` et **n'est jamais
verifiee cote serveur** : les routes font confiance au `userId` envoye par le
client. N'importe qui peut donc liker, commenter, supprimer un article ou un
compte a la place d'un autre. A traiter dans un chantier dedie (session par
cookie `httpOnly`, verification de propriete dans chaque route). Le module
`src/lib/auth/` est en place pour accueillir ce changement.

## Licence

MIT.
