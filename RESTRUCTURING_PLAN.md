# Plan de restructuration : Blog Pattes Douces

> Document destiné à **Opus 5**. À exécuter phase par phase, dans l'ordre.
> **⛔ Règle d'arrêt : à la fin de CHAQUE phase, tu t'arrêtes. Tu ne fais aucun `git commit`, `git add` ni `git push` : c'est l'utilisateur qui commite.** Voir le protocole d'arrêt en §3.
> **Règle de nommage absolue : tous les dossiers, fichiers, routes de pages et routes d'API sont en ANGLAIS.**
> Les textes affichés à l'utilisateur (labels, messages d'erreur, `lang="fr"`) restent en **français**.

---

## 0. Contexte

Application Next.js 16 (App Router + un reste de Pages Router), React 19, Tailwind 4, Prisma sur MongoDB, Vercel Blob pour les images.
Le code applicatif est dans `blog-pattes-douces/` (le dépôt racine ne contient que `README.md`, `.github/`, `.mcp.json`).
Fonctionnalités : inscription/connexion, feed d'articles, page article (vues, like/dislike, commentaires), création/suppression d'article, profil, dashboard de stats, suppression de compte.

Alias TypeScript actuel : `@/*` → `./*` (racine de `blog-pattes-douces/`), d'où les imports `@/src/...`.

## 1. Diagnostic (constaté, pas supposé)

### 1.1 Bloquants

| # | Constat | Preuve |
|---|---------|--------|
| B1 | **`npm run build` échoue actuellement.** `src/pages/user/index.tsx` et `src/pages/user/[id].ts` sont des handlers d'API (`NextApiRequest/Response`, `bcrypt`, Prisma) rangés comme *pages* : Turbopack essaie de les bundler côté navigateur. | Erreur : `Can't resolve '.prisma/client/index-browser'` + `Can't resolve 'fs'`, trace `./src/pages/user/index.tsx` |
| B2 | **Presque toutes les routes d'API sont mortes.** Elles sont dans `src/api/**/route.ts`, or Next ne sert les *route handlers* que sous `app/`. Seul `src/pages/api/*` est servi (`/api/article`, `/api/user`, `/api/article_user`). Le front appelle pourtant `/api/connexion`, `/api/inscription`, `/api/commentaires`, `/api/Add_like/:id`, etc. → 404. | `find src -name route.*` vs les `fetch("/api/...")` |
| B3 | **Handlers Pages Router dans `src/api/`** : `activity`, `dashboard`, `feed/[id]`, `profil` exportent `export default function handler(req, res)` (style Pages Router) dans un fichier `route.ts` (style App Router). Incohérent, ne fonctionnera dans aucun des deux systèmes. | `export default` dans ces 4 fichiers |
| B4 | **Appels vers des routes inexistantes** : `/api/auteurId?user_id` (dans `dashboard/v1.tsx`, aucune route correspondante), redirection vers `/admin` (aucune page), `redirectUrl: "/app/pages.tsx"` renvoyé par `/api/connexion`. | grep |
| B5 | **`app/page.tsx` et `app/Profil/page.tsx` rendent `<html><body>`** alors que `app/layout.tsx` le fait déjà : HTML imbriqué invalide + erreurs d'hydratation. | lecture des fichiers |
| B6 | **Hook appelé conditionnellement** : `dashboard/v1.tsx` fait un `return` anticipé avant `useEffect` (viole les règles des hooks) et lit `localStorage` pendant le rendu. | lecture |

### 1.2 Problèmes de structure

1. **Deux routeurs mélangés** : `src/app/` (App Router), `src/pages/` (Pages Router), plus `src/api/` (ni l'un ni l'autre).
2. **Deux dossiers de composants** : `src/components/header/` et `src/app/Components/` (colocalisé dans `app/` avec majuscule).
3. **Navigation dupliquée à 100 %** : `app/Components/navigation/*` et `app/layout/navigation/*` (seule différence : une couleur de fond dans `Header`). Plusieurs fichiers ne sont que du code commenté.
4. **`app/layout/`** n'est pas un layout Next : c'est un dossier de composants (`AppHeader`, `AppSidebar`, `CoSidebar`, `AfficherSidebar`, `Backdrop`, `SidebarWidget`) qui collisionne conceptuellement avec `layout.tsx`.
5. **Composants pages** : `app/Post_user/page.tsx` est **importé comme composant** par `Profil` et duplique `app/Components/Post_user/index.tsx`. `app/Components/activity/page.tsx` est un `page.tsx` inutile dans un dossier de composants (`return <div>Activité</div>`).
6. **Noms de routes** : mélange de majuscules et de minuscules (`/Feed`, `/Profil`, `/Activity`, `/Connexion`, `/Inscription`, `/Article_page/[id]`, `/Creation_article`, `/Post_user`, `/dashboard`, `/commentaires`), de français et d'anglais, de snake_case. Les URLs sont sensibles à la casse sur Linux/Vercel. Les liens sont écrits à la main partout (`../Feed`, `../Inscription`, `/Dashboard` vs `/dashboard`…).
7. **API** : noms français, casse mixte, verbes dans les URLs (`/api/Add_like/[id]`, `/api/supp_compte`, `/api/articles_user/supprimer`, `/api/creation_article`, `/api/get_userid`). Pas de REST.
8. **Prisma** : `new PrismaClient()` instancié dans ~20 fichiers ; le singleton `src/db/prisma.ts` n'est utilisé que par `connexion`. Risque d'épuisement de connexions en dev/serverless.
9. **Code mort / doublons de handlers** : `pages/api/user/{index,create,[id]}`, `pages/user/{index,[id]}` (mêmes handlers copiés), `pages/api/article_user/create.Ts` (extension `.Ts`) et `pages/api/article/create.ts` (contiennent du code App Router `GET/POST` de commentaires dans un dossier Pages), `pages/api/hello.tsx` (vide), `create.ts` entièrement commenté.
10. **Artefacts de build commités** : 26 fichiers `.js`, `.d.ts`, `.js.map` dans `app/Components/ui/icons/` (sortie de `tsc`), et `tsconfig.unused.tsbuildinfo` traîne dans le dossier (ignoré par git, à supprimer).
11. **Assets en triple** : `blog-pattes-douces/assets/`, `src/app/assets/` (mêmes images : `Background_blog.jpg`, `Cat_default.jpg`, `icons8-cat-32.*`), plus `public/` qui ne contient que les SVG par défaut de create-next-app. Il y a aussi `src/icons/` (SVG + `index.tsx`) **et** `app/Components/ui/icons/` (JS compilé) : deux systèmes d'icônes, plus `@heroicons/react` utilisé dans la sidebar.
12. **Composants du template TailAdmin** probablement non utilisés (`ui/alert`, `ui/badge`, `ui/modal`, `ui/table`, `ui/images/*`, `ui/video/*`, `Home`, `Posts`, `SidebarWidget` qui pointe vers tailadmin.com/pricing, `NotificationDropdown` de 384 lignes de données factices). À vérifier par grep avant suppression.
13. **Dépendances / config** :
    - Deux lockfiles : `package-lock.json` **et** `pnpm-lock.yaml`. Le README dit `pnpm`. → garder pnpm uniquement.
    - Doublons : `bcrypt` **et** `bcryptjs` (le code utilise les deux), `heroicons` **et** `@heroicons/react`, `@types/express` inutile.
    - `next-auth` installé mais **non utilisé** (seule mention : un import parasite `import { DateTime } from "next-auth/providers/kakao"` dans `Post_user/page.tsx`).
    - Script `"lint": "next lint"` : la commande n'existe plus dans Next 16 → utiliser `eslint .`. Aucune config ESLint n'est présente dans le dépôt.
    - `README.md` du sous-projet = README create-next-app non modifié ; README racine avec un chemin `.\Blog-Pattes-Douces\` erroné.
    - `tsconfig` : `allowJs` + un `route.js` non typé ; alias `@/*` → `./*` force les imports `@/src/...`.
    - **À vérifier** : Prisma 7 ne supporte pas MongoDB à ma connaissance, et `url = env(...)` dans le `datasource` n'est plus valide en v7 (config déplacée dans `prisma.config.ts`). `node_modules` contient Prisma 7.9.1 alors que `package.json` demande `^7.10.0`. Ne rien migrer de force : signaler le résultat à l'utilisateur (voir phase 0 étape 4).
14. **Authentification** : aucune session. L'identité est un `user_id` stocké dans `localStorage`, et les routes d'API font confiance au `userId` envoyé dans le corps de la requête (n'importe qui peut liker/supprimer/commenter pour le compte d'un autre, y compris supprimer un compte). Un ID utilisateur MongoDB est codé en dur dans `Connexion/page.tsx` pour rediriger vers `/admin`. **Hors périmètre de cette restructuration** (voir §6), mais l'architecture cible doit préparer le terrain (dossier `lib/auth`).

## 2. Architecture cible

Principes : **une seule racine** (`src/`), **App Router uniquement**, **organisation par fonctionnalité** (`features/`) plutôt que par type, `app/` réservé au routage, alias `@/` → `src/`.

```
blog-pattes-douces/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── images/                    # <- fusion de assets/ + src/app/assets/ + logo
│   │   ├── background-blog.jpg
│   │   ├── cat-default.jpg
│   │   └── logo.webp
│   └── favicon.ico
├── src/
│   ├── app/                       # ROUTAGE UNIQUEMENT (pages, layouts, route handlers)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx               # landing -> redirige ou affiche le feed
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/                # groupe avec header + sidebar + footer partagés
│   │   │   ├── layout.tsx         # remplace les copies de Header/Sidebar/Footer dans chaque page
│   │   │   ├── feed/page.tsx
│   │   │   ├── articles/
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── my-articles/page.tsx
│   │   │   ├── activity/page.tsx
│   │   │   ├── comments/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   └── api/                   # route handlers App Router, REST, un seul style
│   │       ├── auth/
│   │       │   ├── login/route.ts             POST
│   │       │   └── register/route.ts          POST
│   │       ├── users/
│   │       │   ├── route.ts                   GET ?pseudo= (remplace get_userid)
│   │       │   └── [id]/route.ts              GET, DELETE (remplace supp_compte)
│   │       ├── articles/
│   │       │   ├── route.ts                   GET ?authorId=, POST
│   │       │   └── [id]/
│   │       │       ├── route.ts               GET, DELETE
│   │       │       ├── views/route.ts         POST
│   │       │       ├── like/route.ts          POST
│   │       │       └── dislike/route.ts       POST
│   │       ├── comments/route.ts              GET ?articleId=, POST
│   │       └── uploads/route.ts               POST (remplace avatar/upload)
│   ├── features/
│   │   ├── auth/            (components/, hooks/useCurrentUser.ts, services/)
│   │   ├── articles/        (components/{ArticleCard,ArticleFeed,ArticleForm,ArticleActions}, services/, types.ts)
│   │   ├── comments/        (components/, services/, types.ts)
│   │   ├── dashboard/       (components/{StatsOverview,StatsChart}, services/)
│   │   └── profile/         (components/)
│   ├── components/
│   │   ├── layout/          # Header, Sidebar, Footer, Backdrop, Navbar (UNE seule version de chaque)
│   │   └── ui/              # Button, Avatar, Dropdown, ... uniquement ceux réellement utilisés
│   ├── context/             # SidebarContext, ThemeContext
│   ├── icons/               # SVG + index.tsx (seul système d'icônes local)
│   ├── lib/
│   │   ├── prisma.ts        # singleton unique (ex src/db/prisma.ts)
│   │   ├── routes.ts        # constantes de routes (ROUTES.feed, ROUTES.article(id), ...)
│   │   ├── api-client.ts    # petits wrappers fetch typés
│   │   └── auth/            # session/localStorage aujourd'hui, prêt pour une vraie session
│   └── types/               # types partagés (Article, Comment, User) alignés sur Prisma
├── next.config.ts
├── tsconfig.json            # alias "@/*": ["./src/*"]
├── eslint.config.mjs
└── package.json
```

### 2.1 Table de correspondance des routes de pages

| Ancienne route | Nouvelle route | Ancien fichier → nouveau |
|---|---|---|
| `/` | `/` | `app/page.tsx` → `app/page.tsx` (sans `<html>`) |
| `/Connexion` | `/login` | `app/Connexion/page.tsx` → `app/(auth)/login/page.tsx` |
| `/Inscription` | `/register` | `app/Inscription/page.tsx` → `app/(auth)/register/page.tsx` |
| `/Feed` | `/feed` | `app/Feed/page.tsx` → `app/(main)/feed/page.tsx` |
| `/Article_page/[id]` | `/articles/[id]` | → `app/(main)/articles/[id]/page.tsx` |
| `/Creation_article` | `/articles/new` | → `app/(main)/articles/new/page.tsx` |
| `/Post_user` | `/my-articles` | → `app/(main)/my-articles/page.tsx` (ne plus l'importer comme composant : extraire `MyArticlesList` dans `features/articles`) |
| `/Profil` | `/profile` | → `app/(main)/profile/page.tsx` |
| `/Activity` | `/activity` | → `app/(main)/activity/page.tsx` |
| `/commentaires` | `/comments` | → `app/(main)/comments/page.tsx` |
| `/dashboard` | `/dashboard` | → `app/(main)/dashboard/page.tsx` |
| `/admin` (n'existe pas) | supprimé | retirer la redirection en dur |

Comme les URLs changent de casse, ajouter dans `next.config.ts` des `redirects()` **permanentes** depuis les anciennes URLs (`/Feed` → `/feed`, `/Connexion` → `/login`, etc.) pour ne pas casser les favoris.

### 2.2 Table de correspondance des routes d'API

| Ancien | Nouveau | Méthode |
|---|---|---|
| `/api/connexion` | `/api/auth/login` | POST |
| `/api/inscription` | `/api/auth/register` | POST |
| `/api/get_userid?pseudo=` | `/api/users?pseudo=` | GET |
| `/api/supp_compte` | `/api/users/[id]` | DELETE |
| `/api/article` (Pages) | `/api/articles` | GET |
| `/api/article?authorId=` | `/api/articles?authorId=` | GET |
| `/api/article_page/[id]` | `/api/articles/[id]` | GET |
| `/api/creation_article` | `/api/articles` | POST |
| `/api/articles_user/supprimer` | `/api/articles/[id]` | DELETE |
| `/api/AddView/[id]` | `/api/articles/[id]/views` | POST |
| `/api/Add_like/[id]` | `/api/articles/[id]/like` | POST |
| `/api/Add_dislike/[id]` | `/api/articles/[id]/dislike` | POST |
| `/api/commentaires` | `/api/comments` | GET, POST |
| `/api/avatar/upload` | `/api/uploads` | POST |
| `/api/dashboard`, `/api/feed/[id]`, `/api/profil`, `/api/activity`, `/api/auteurId` | **supprimés** : leurs besoins sont couverts par `GET /api/articles` (filtres `authorId`, tri) ; `/api/activity` (création d'article) doublonne `POST /api/articles` |

### 2.3 Conventions de nommage

- Dossiers et fichiers **non-composants** : `kebab-case` (`api-client.ts`, `my-articles/`).
- Composants React : `PascalCase.tsx` (`ArticleCard.tsx`), **pas de `index.tsx` anonymes** dans des dossiers portant le nom du composant.
- Variables, fonctions, types, props : anglais (`article`, `comment`, `author`, `userId`, `likes`). Fini `Post_user`, `Creation_article`, `AfficherSidebar`, `dispComUser`, `Feedhome`, `CoSidebar`.
- Plus aucun composant nommé `Xxx_yyy` (snake_case).
- Composants Client : `"use client"` uniquement quand nécessaire ; préférer des Server Components pour la lecture de données quand c'est simple.

## 3. Phases d'exécution

**Protocole d'arrêt (obligatoire à la fin de chaque phase, y compris la dernière) :**
1. Terminer la phase, puis lancer la vérification : `pnpm build` (ou au minimum `pnpm exec tsc --noEmit`) doit passer, sauf phase 0 qui établit la base. Si ça échoue, corriger avant de t'arrêter ; si tu ne peux pas, le dire.
2. **Ne rien commiter, ne rien stager** (pas de `git add`/`git commit`). Laisser les changements dans l'arbre de travail.
3. Envoyer un court compte rendu : ce qui a été fait, résultat de la vérification, points non vérifiés ou questions ouvertes, et `git status --short` résumé (nombre de fichiers déplacés/supprimés/modifiés).
4. **Suggérer le message de commit** au format Conventional Commits, dans un bloc de code prêt à copier, par exemple :
   ```
   refactor(api): move route handlers to app/api with English REST names
   ```
   Un message court (≤ 72 caractères) en anglais, éventuellement suivi d'un corps de 2-4 lignes si utile.
5. **S'arrêter et attendre** que l'utilisateur réponde (« ok, commité » ou une demande de correction) avant de commencer la phase suivante. Ne jamais enchaîner deux phases dans le même tour.

Messages de commit suggérés par défaut (à adapter à ce qui a réellement été fait) :
| Phase | Suggestion |
|---|---|
| 0 | `chore: keep pnpm only and remove stray build artifacts` |
| 1 | `refactor(api): move route handlers to app/api with English REST names` |
| 2 | `refactor: add @/ alias to src, move prisma singleton and merge assets` |
| 3 | `refactor(ui): reorganize components by feature and rename routes to English` |
| 4 | `chore: clean dependencies, fix lint script and rewrite README` |
| 5 | `chore: final verification fixes after restructuring` (seulement s'il y a des changements) |
| 6 (si demandée) | `refactor(db): rename Prisma models to English with @map` |

Utiliser `git mv` pour conserver l'historique (les déplacements sont alors visibles dans `git status` une fois stagés par l'utilisateur ; si `git mv` stage automatiquement, le signaler dans le compte rendu). Ne jamais faire de renommage insensible à la casse en une seule étape (Linux OK, mais Windows/macOS non : faire `Feed` → `feed-tmp` → `feed` si le dépôt est partagé).

### Phase 0 : Base saine
1. Créer une branche `refactor/project-structure`.
2. Supprimer `blog-pattes-douces/tsconfig.unused.tsbuildinfo`.
3. Garder **pnpm** : supprimer `package-lock.json`, mettre `"packageManager"` dans `package.json`. `pnpm install`.
4. **Vérifier la compatibilité Prisma/MongoDB** : `pnpm exec prisma validate` et `pnpm exec prisma generate`. Si Prisma 7 refuse MongoDB, **ne pas continuer sur ce point sans avis** : proposer à l'utilisateur soit de figer `prisma`/`@prisma/client` sur la dernière 6.x, soit une autre stratégie. Consigner le résultat dans le compte rendu final.
5. Noter l'état initial du build (il échoue : B1) pour comparer.

### Phase 1 : Débloquer le build et ressusciter l'API (correction de B1 à B4)
1. Supprimer `src/pages/` **en entier** (`pages/user/*`, `pages/api/hello.tsx`, `pages/api/user/*`, `article_user/*`, `article/create.ts`) après avoir **migré** en App Router l'équivalent utile de `pages/api/article/index.tsx` (`GET /api/articles` avec `include: { auteur: true }`, `orderBy: { date: "desc" }`).
2. Déplacer `src/api/**` → `src/app/api/**` **avec les nouveaux noms de la table 2.2**, en convertissant en *route handlers* App Router (`export async function GET/POST/DELETE(request, { params })`).
   - Next 16 : `params` est une **Promise** → `const { id } = await params;` (les routes actuelles utilisent `params.id` synchrone, ce qui est cassé).
   - Convertir `article_page/[id]/route.js` en TypeScript.
   - Remplacer chaque `new PrismaClient()` par `import { prisma } from "@/lib/prisma"`.
   - Supprimer `dashboard`, `feed/[id]`, `profil`, `activity` (handlers Pages Router) et couvrir leurs cas par `GET /api/articles`.
   - `login` : retourner `{ user: { id, pseudo } }` (le serveur renvoie l'`id` directement → supprime l'appel séparé `get_userid` dans `Connexion`) et retirer le `redirectUrl` erroné.
   - `DELETE /api/articles/[id]` : reprendre la logique de `articles_user/supprimer` (suppression des commentaires puis de l'article), sans changer le comportement.
3. Ne rien changer à la logique métier ni aux contrats de réponse, sauf ce qui est listé ci-dessus. Mettre à jour tous les `fetch("/api/...")` du front vers les nouvelles URLs (voir phase 3 pour la centralisation).

### Phase 2 : Alias, dossiers et assets
1. `tsconfig.json` : `"paths": { "@/*": ["./src/*"] }`, `allowJs: false`, retirer `.next/dev/types/**/*.ts` seulement si inutile ; **remplacer tous les `@/src/...` par `@/...`**.
2. Déplacer `src/db/prisma.ts` → `src/lib/prisma.ts` (singleton, `globalThis` typé, en conservant la logique de log dev).
3. Assets : fusionner `assets/` + `src/app/assets/` dans `public/images/` (noms en kebab-case), mettre à jour les références (`grep -rn "assets/"`), supprimer les dossiers d'origine et les SVG par défaut de create-next-app dans `public/` (`file`, `globe`, `next`, `vercel`, `window`) **après grep** qu'ils ne sont pas référencés. Déplacer `src/app/favicon.ico` à sa place standard (le laisser dans `app/` est valide en App Router : le garder s'il est utilisé).
4. Supprimer les 26 fichiers compilés (`.js`, `.d.ts`, `.js.map`) de `app/Components/ui/icons/`. Avant : vérifier avec grep si des composants importent ces icônes (`collapse-icon`, `eye-icon`, `thumbs-up`…). Si oui, les remplacer par `src/icons/index.tsx` ou `@heroicons/react` (choisir **un seul** système, recommandé : SVG locaux via `src/icons` + Heroicons uniquement si déjà utilisé, sinon retirer la dépendance).
5. Ajouter `*.js`, `*.d.ts`, `*.js.map` sous `src/` dans `.gitignore` seulement si nécessaire ; le vrai correctif est de ne plus compiler dans `src/`.

### Phase 3 : Composants et routes de pages
1. Déplacer `src/app/Components/**` et `src/app/layout/**` vers `src/components/` et `src/features/` selon la cible (§2). Correspondance :
   | Ancien | Nouveau |
   |---|---|
   | `app/layout/{AppHeader,AppSidebar,CoSidebar,Backdrop}` + `components/header/{UserDropdown,NotificationDropdown}` | `components/layout/{Header,Sidebar,Backdrop,UserDropdown,NotificationDropdown}.tsx` (fusionner `AfficherSidebar` + `AppSidebar` + `CoSidebar` en **un seul** `Sidebar` qui choisit ses liens selon l'état connecté) |
   | `app/Components/navigation/*` **et** `app/layout/navigation/*` | `components/layout/{Navbar,Footer}.tsx` (garder **une** version, supprimer l'autre et tout code commenté) |
   | `app/Components/feed` | `features/articles/components/ArticleFeed.tsx` |
   | `app/Components/Posts`, `app/Components/Post_user`, `app/Post_user/page.tsx` | `features/articles/components/MyArticlesList.tsx` (une seule implémentation) |
   | `app/Components/creation_article` | `features/articles/components/ArticleForm.tsx` |
   | `app/Components/commentaires`, `dispComUser` | `features/comments/components/{CommentForm,CommentList}.tsx` |
   | `app/Components/dashboard/{index,v1}` + `Stats/metrics/graph` | `features/dashboard/components/{StatsOverview,StatsChart}.tsx` (garder la version de `v1.tsx` **uniquement** si elle est utilisée ; sinon supprimer) |
   | `app/Components/activity/{index,page}` | `features/activity/components/ActivityList.tsx` ; supprimer le `page.tsx` parasite |
   | `app/Components/Home`, `ui/*` non utilisés | supprimer après grep (voir §1.2 point 12) |
   | `app/Components/ui/*` utilisés | `components/ui/` |
2. Créer `app/(main)/layout.tsx` qui monte **une fois** `SidebarProvider`, `Header`, `Sidebar`, `Footer` (aujourd'hui recopiés dans chaque page). Les pages ne contiennent plus que leur contenu.
3. Renommer les routes selon §2.1. Retirer `<html>`/`<body>` de `app/page.tsx` et de `Profil`.
4. Créer `lib/routes.ts` et n'utiliser **que** ces constantes dans les `<Link>`/`router.push`/`href` (fini `../Feed`, `/Dashboard` vs `/dashboard`).
5. Ajouter `redirects()` dans `next.config.ts` pour les anciennes URLs (§2.1).
6. Créer `lib/api-client.ts` (ou des `services/*.ts` par feature) : **toutes** les requêtes `fetch("/api/...")` y passent, typées avec `types/`. Plus de `fetch` en dur dans les composants.
7. Corriger B5/B6 au passage (HTML imbriqué, hook conditionnel) ; supprimer l'import parasite `next-auth/providers/kakao`.
8. Footer : les liens `/about`, `/contact`, `/privacy`, `/terms` pointent vers des pages inexistantes. Les laisser tels quels mais le **signaler** dans le compte rendu (ne pas inventer de pages).

### Phase 4 : Dépendances, outillage, docs
1. Retirer : `bcrypt` (garder `bcryptjs`, en vérifiant que toutes les routes migrées l'utilisent ; les hashes sont compatibles), `heroicons` (garder `@heroicons/react` si utilisé), `@types/bcrypt`, `@types/express`, et `next-auth` **si** plus aucun import après la phase 3 (sinon signaler).
2. `"lint": "eslint ."` ; ajouter un `eslint.config.mjs` minimal basé sur `eslint-config-next`. Corriger uniquement les erreurs bloquantes ; lister le reste.
3. Réécrire `blog-pattes-douces/README.md` (stack, variables d'environnement `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, commandes pnpm, structure du dossier) et corriger le chemin dans le README racine. Ajouter un `.env.example`.
4. Vérifier que les workflows CI de `.github/` référencent toujours les bons chemins (dossier `blog-pattes-douces/`).

### Phase 5 : Vérification finale
1. `pnpm install --frozen-lockfile && pnpm exec tsc --noEmit && pnpm lint && pnpm build` : tout doit passer.
2. `grep -rn` de contrôle : aucun `@/src/`, aucun `new PrismaClient(` hors `lib/prisma.ts`, aucun `fetch("/api` hors `lib/`/`services/`, aucune route ou dossier avec majuscule ou underscore dans `src/app`, aucune URL de l'ancienne table.
3. Démarrer `pnpm dev` (avec `DATABASE_URL` si disponible) et parcourir : inscription → connexion → feed → ouvrir un article (vue) → like/dislike → commenter → créer un article (avec image) → supprimer l'article → profil → dashboard → suppression du compte. Utiliser le MCP `next-devtools` déjà configuré (`.mcp.json`) pour lister les routes réellement enregistrées et lire les erreurs. **Si la base n'est pas disponible, le dire explicitement au lieu d'affirmer que le parcours fonctionne.**

### Phase 6 (OPTIONNELLE, ne pas faire sans validation de l'utilisateur) : modèle de données en anglais
Les modèles/champs Prisma sont en français (`User.biographie`, `Article.titre/texte/auteur/vue/reaction1/reaction2`, `Commentaire`, `commentataire`, `article_source`). Les renommer en anglais (`bio`, `title`, `content`, `author`, `views`, `likes`, `dislikes`, `Comment`, `commenter`, `article`) **en conservant les noms MongoDB avec `@map` / `@@map`** pour ne demander aucune migration de données. Impacte tout le code qui lit ces champs (routes API, types, composants). Comme c'est le plus gros risque de régression, ne le faire que si l'utilisateur le demande.

## 4. Critères d'acceptation

- [ ] `pnpm build` réussit (il échoue aujourd'hui).
- [ ] Un seul routeur (`src/app`), aucun dossier `src/pages`, `src/api`, `src/db`, `src/app/Components`, `src/app/layout`.
- [ ] Toutes les routes de pages et d'API sont en anglais, en minuscules, en `kebab-case`, conformes aux tables 2.1 et 2.2.
- [ ] Une seule implémentation de : Header, Sidebar, Footer, Navbar, liste d'articles de l'utilisateur, singleton Prisma.
- [ ] Anciennes URLs de pages redirigées en 308 vers les nouvelles.
- [ ] Aucun fichier compilé (`.js`/`.d.ts`/`.js.map`) ni `.tsbuildinfo` dans le dépôt ; un seul lockfile (pnpm).
- [ ] Le comportement fonctionnel visible par l'utilisateur est **identique** (mêmes écrans, mêmes textes en français).

## 5. Méthode de travail attendue

- Explorer avant de supprimer : chaque suppression de composant est précédée d'un `grep` prouvant qu'il n'est pas utilisé.
- **Un arrêt par phase, sans commit de ta part** (voir protocole d'arrêt en §3) : tu suggères le message, l'utilisateur commite. Ne pas mélanger renommage et modification de logique dans la même phase quand c'est évitable, pour que chaque commit reste lisible.
- Ne pas ajouter de fonctionnalité, de test ou d'abstraction qui n'est pas demandé ici.
- En cas d'ambiguïté bloquante (Prisma 7/MongoDB, composant apparemment utilisé mais douteux), **s'arrêter et poser la question** plutôt que deviner.
- Compte rendu final : ce qui a été fait par phase, ce qui a été supprimé, ce qui n'a pas pu être vérifié (notamment le parcours complet sans base de données), et la liste des points laissés hors périmètre (§6).

## 6. Hors périmètre (à signaler, ne pas traiter)

- **Sécurité / authentification** : identité côté client via `localStorage`, `userId` fourni par le client et non vérifié côté serveur (liker, commenter, supprimer un article ou un compte pour n'importe quel utilisateur), aucun contrôle d'autorisation, upload Blob sans validation de type/taille ni authentification. Recommandation : chantier séparé (Auth.js / sessions par cookie `httpOnly`, vérification de propriété dans chaque route). La structure cible prévoit `lib/auth/` pour l'accueillir.
- **Modèle de données** : réactions stockées comme tableaux d'IDs dans `Article`/`Commentaire` (`reaction1`, `reaction2`, `vue`), non scalable ; enum `Reactions` déclaré mais inutilisé.
- **Pages légales** (`/about`, `/contact`, `/privacy`, `/terms`) inexistantes.
- Refonte visuelle, tests automatisés, i18n.
