<p align="center">
  <img src="public/images/logo.png" alt="Logo Pattes Douces" width="96">
</p>

<h1 align="center">Pattes Douces — référence technique</h1>

<p align="center">
  Architecture, modèle de données, API, i18n et choix techniques de l'application.<br>
  Présentation du projet et installation pas à pas : <a href="../README.md"><b>README principal</b></a>.
  Règles d'interface et d'accessibilité : <a href="../DESIGN.md"><b>DESIGN.md</b></a>.
</p>

---

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Structure du code](#structure-du-code)
- [Internationalisation](#internationalisation)
- [Traduction des contenus](#traduction-des-contenus)
- [Modèle de données](#modèle-de-données)
- [API REST](#api-rest)
- [Tests](#tests)
- [Docker](#docker)
- [Sécurité](#sécurité)
- [Contraintes de versions](#contraintes-de-versions)

---

## Démarrage rapide

```bash
cp .env.example .env

# Option A : pnpm (base MongoDB dans Docker)
pnpm install && pnpm db:up && pnpm db:push && pnpm translation:setup && pnpm dev

# Option B : tout dans Docker
docker compose --profile app up -d --build --wait
```

Application sur http://localhost:3000 (redirigée vers `/fr`, `/en`, `/ar` ou
`/zh`). `pnpm translation:setup` n'est utile que pour la traduction des
contenus. Prérequis, variables d'environnement et dépannage : voir le
[README principal](../README.md#installation-locale).

## Structure du code

```
src/
├── app/
│   ├── globals.css           Jetons de couleur (clair / sombre), Tailwind 4, focus, mouvement réduit
│   ├── [lang]/               Toutes les pages, une version par langue (fr, en, ar, zh)
│   │   ├── layout.tsx        Layout racine : <html lang dir>, polices, thème, i18n, shell
│   │   ├── page.tsx          Accueil (fil d'actualité)
│   │   ├── not-found.tsx     404 dans le shell ; [...rest]/ y renvoie les URL inconnues
│   │   ├── error.tsx         Error boundary (Client Component)
│   │   ├── (auth)/           login, register
│   │   ├── (main)/           feed, articles, my-articles, profile, activity, comments, dashboard
│   │   └── (info)/           about, contact, privacy, accessibility
│   └── api/                  API REST (route handlers), hors du segment de langue
├── components/
│   ├── layout/               Shell : Sidebar, TopBar, MobileDrawer, NavLinks, ThemeToggle, LanguageSwitcher, Footer
│   ├── ui/                   Button, FormField, Toast, ConfirmDialog, Skeleton, EmptyState, Stats, Avatar, Logo
│   ├── icons/                Icônes au trait (SVG, aria-hidden)
│   └── info/                 Mise en page des pages d'information
├── features/                 Code métier ("use client"), regroupé par fonctionnalité
│   ├── auth/                 LoginForm, RegisterForm, RequireAuth, useLogout
│   ├── articles/             ArticleFeed, ArticleCard, ArticleDetail, ArticleForm, MyArticlesList, useReact
│   ├── translation/          Traduction des contenus (Web Worker Transformers.js)
│   ├── comments/             CommentList
│   ├── activity/             ActivityList
│   ├── dashboard/            StatsView, hooks/useUserStats.ts
│   └── profile/              ProfileView
├── i18n/                     Langues, messages JSON, formatage, navigation localisée
├── theme/                    Thème clair / sombre (script anti-flash, useTheme)
├── lib/
│   ├── prisma.ts             Singleton Prisma + publicUserSelect (champs utilisateur exposables)
│   ├── validation.ts         Règles de validation partagées client / serveur
│   ├── http.ts               Lecture sûre du JSON des requêtes, réponses 400
│   ├── reactions.ts          Bascule j'aime / je n'aime pas (partagée par les deux routes)
│   ├── routes.ts             Toutes les URL : pages (sans langue) et API
│   ├── api-client.ts         Tous les appels réseau du navigateur (ApiError avec le statut HTTP)
│   └── auth/session.ts       Identité de l'utilisateur courant (localStorage)
├── types/                    Types partagés, alignés sur Prisma
└── proxy.ts                  Choix de la langue et redirection des anciennes URL
scripts/
└── translation-assets.mjs    Installe les modèles de traduction et le moteur ONNX dans public/
```

**Conventions**

- `src/app/` ne contient que du routage ; la logique interactive est dans `src/features/`.
- Dossiers et routes en **anglais**, minuscules, `kebab-case` ; composants en `PascalCase.tsx`.
- Aucun texte affiché en dur : tout passe par les messages de `src/i18n/messages/`.
- Aucune URL écrite en dur : les chemins viennent de `lib/routes.ts` (sans langue)
  et les liens passent par `Link` / `useRouter` de `src/i18n/navigation.tsx`,
  qui ajoutent la langue. Aucun `fetch` hors de `lib/api-client.ts`.
- Aucune couleur en dur : jetons CSS de `globals.css` (`bg-surface`, `text-ink`…).
- Les anciennes URL (`/Feed`, `/Connexion`, `/Article_page/:id`...) sont redirigées
  en 308 (`next.config.ts` et `src/proxy.ts`), puis vers la bonne langue.

## Internationalisation

Selon le guide « Internationalization » de Next.js 16
(`node_modules/next/dist/docs/01-app/02-guides/internationalization.md`).

| Élément | Fichier | Rôle |
|---|---|---|
| Langues | `src/i18n/config.ts` | `fr` (défaut), `en`, `ar` (RTL), `zh` ; nom, sens, drapeau, locale des dates ; négociation `Accept-Language` |
| Routage | `src/proxy.ts` | Une URL sans langue est redirigée : cookie `NEXT_LOCALE`, sinon `Accept-Language`, sinon `fr` |
| Messages | `src/i18n/messages/{fr,en,ar,zh}.json` | Textes par espace de noms (`shell`, `feed`, `article`, `login`…) ; le français est la référence |
| Chargement | `src/i18n/dictionaries.ts` | `getDictionary()` lit la langue avec `next/root-params` et charge seulement son dictionnaire ; `pageTitle()` traduit le `<title>` |
| Client | `src/i18n/I18nProvider.tsx` | `useI18n()` : `t` (messages), `f()` (variables `{nom}`), `p()` (pluriels), `r()` (variable React), `date()` |
| Navigation | `src/i18n/navigation.tsx` | `Link`, `useRouter`, `usePathname`, `useSwitchLocale` localisés |

- **Pluriels** : objets de formes CLDR (`{ "one": …, "other": … }`, 6 formes en
  arabe, 1 en chinois), accordés par `Intl.PluralRules`.
- **Typage** : le type `Messages` est déduit de `fr.json` ; une clé manquante
  dans une autre langue fait échouer la compilation, et un test vérifie la
  parité des clés et des variables.
- **Ajouter un texte** : ajouter la clé dans les 4 fichiers JSON, puis
  l'utiliser via `t.espace.cle`.
- Les contenus des membres gardent leur langue (`Article.langue`,
  `Commentaire.langue`) et sont balisés avec `lang` (RGAA 8.7).

## Traduction des contenus

Bouton « Traduire en … » sous un article et sous chaque commentaire écrit dans
une autre langue que celle de l'interface (voir [DESIGN.md §9.15](../DESIGN.md)).

| Élément | Fichier | Rôle |
|---|---|---|
| Modèles | `src/features/translation/models.ts` | 6 modèles Opus-MT (fr, ar, zh ↔ en) ; pivot par l'anglais ; découpage par paragraphe et par phrase |
| Worker | `src/features/translation/translation.worker.ts` | Transformers.js (q8, WebAssembly), modèles chargés une fois, texte renvoyé au fil de la traduction |
| Client | `src/features/translation/translator.ts` | Un worker par page, cache des traductions pour la session, préchauffage au survol / focus |
| Interface | `useContentTranslation.ts`, `TranslateControl.tsx` | Bascule traduction / original, zone `role="status"`, `lang` par texte |
| Fichiers | `scripts/translation-assets.mjs` | `pnpm translation:setup` : modèles dans `public/models` (~680 Mo), moteur dans `public/ort` (~40 Mo) |

- Tout est servi par le site (`env.allowRemoteModels = false`) : aucun texte
  n'est envoyé à un service tiers.
- Les dossiers `public/models` et `public/ort` sont ignorés par git ; le
  Dockerfile les prépare dans une étape mise en cache.
- Limite : ces petits modèles traduisent bien fr ↔ en ; les paires qui passent
  par l'anglais (vers l'arabe notamment) restent approximatives.

## Modèle de données

Défini dans [`prisma/schema.prisma`](prisma/schema.prisma). Les noms de champs
sont ceux de la base (en français).

| Modèle | Champs principaux | Remarques |
|---|---|---|
| **User** | `pseudo` (unique), `email` (unique), `password`, `biographie`, `espece` | `password` est un hash bcrypt, jamais renvoyé ; `espece` : `cat`, `dog`, `rabbit`, `kitten`, `puppy`, `pet` (facultatif) |
| **Article** | `titre`, `texte`, `image`, `langue`, `date`, `auteurId` | `vue`, `reaction1` (j'aime), `reaction2` (je n'aime pas) : listes d'id d'utilisateurs ; `langue` : langue de rédaction (facultatif) |
| **Commentaire** | `texte`, `langue`, `date`, `article_sourceId`, `commentataireId` | Supprimé avec son article ou avec le compte de son auteur |

Les champs `espece` et `langue` sont facultatifs : les documents existants
restent valides sans migration (un contenu sans langue est considéré comme
français). Les index uniques sont créés par `pnpm db:push` (service `db-init`
sous Docker).

## API REST

Toutes les routes sont des route handlers dans `src/app/api/` (hors du segment
de langue, non concernées par le proxy).

| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/api/auth/login` | Connexion, renvoie `{ user: { id, pseudo, espece } }` |
| `POST` | `/api/auth/register` | Inscription (pseudo 3-30 caractères, email, mot de passe fort, `espece` facultative) |
| `GET` `DELETE` | `/api/users/[id]` | Lit (`id`, `pseudo`, `espece`, `biographie`) ou supprime un compte et tout son contenu |
| `GET` `POST` | `/api/articles` | Liste (avec `_count.commentaires`) ou crée un article (renvoie son `id`) |
| `GET` `DELETE` | `/api/articles/[id]` | Lit (commentaires du plus ancien au plus récent) ou supprime un article et ses commentaires |
| `POST` | `/api/articles/[id]/views` | Enregistre une vue (une par utilisateur) |
| `POST` | `/api/articles/[id]/like` | Ajoute ou retire un j'aime |
| `POST` | `/api/articles/[id]/dislike` | Ajoute ou retire un je n'aime pas |
| `GET` `POST` | `/api/comments` | Liste ou crée un commentaire |
| `POST` | `/api/uploads?filename=` | Téléverse une image vers Vercel Blob |

Les créations d'article et de commentaire acceptent un champ `langue`
(`fr`, `en`, `ar`, `zh`) : la langue de l'interface au moment de la rédaction.

**Filtres des listes** (appliqués par la base, pas par le navigateur)

| Route | Paramètre | Résultat |
|---|---|---|
| `GET /api/articles` | `?authorId=` | Articles d'un auteur |
| | `?reactedBy=` | Articles aimés ou non aimés par un utilisateur |
| `GET /api/comments` | `?articleId=` | Commentaires d'un article |
| | `?commenterId=` | Commentaires écrits par un utilisateur |
| | `?authorId=` | Commentaires reçus sur les articles d'un auteur |

**Codes de réponse** : `400` entrée invalide · `401` identifiants incorrects ·
`404` ressource introuvable · `409` pseudo ou email déjà pris ·
`413` / `415` image trop lourde / format refusé · `503` upload non configuré.
Les erreurs ont la forme `{ "error": "..." }` ou `{ "message": "..." }` ;
l'interface affiche un message traduit à partir du statut HTTP (`ApiError`).

## Tests

Tests unitaires avec [Vitest](https://vitest.dev) (`vitest.config.mts`,
environnement `node`, alias `@/` résolus nativement). Les fichiers
`*.test.ts` sont placés à côté du code testé.

```bash
pnpm test          # une exécution (aussi lancée en CI)
pnpm test:watch    # en continu
```

| Fichier | Couvre |
|---|---|
| `src/i18n/format.test.ts` | Variables, pluriels (fr, en, ar à 6 formes, zh), `rich`, dates |
| `src/i18n/config.test.ts` | `isLocale`, négociation `Accept-Language` |
| `src/i18n/messages.test.ts` | Mêmes clés, mêmes types et mêmes `{variables}` dans les 4 langues |
| `src/i18n/navigation.test.ts` | `localizePath`, `stripLocale` |
| `src/lib/validation.test.ts`, `src/lib/routes.test.ts` | Règles de saisie, `safeNext`, URL de connexion |
| `src/proxy.test.ts` | Redirections de langue (cookie, `Accept-Language`), anciennes URL, matcher |
| `src/features/translation/*.test.ts` | Routes de modèles et pivot, découpage du texte, messages avec le worker, cache |

Les composants React ne sont pas testés unitairement (les Server Components
asynchrones ne sont pas pris en charge par Vitest) ; ils sont vérifiés dans le
navigateur.

## Docker

**`Dockerfile`** : build en plusieurs étapes sur `node:24-slim`.

| Étape | Contenu |
|---|---|
| `deps` | Dépendances (`pnpm install --frozen-lockfile`) et client Prisma |
| `translation` | `scripts/translation-assets.mjs` : modèles et moteur ONNX, en cache tant que le script et le lockfile ne changent pas |
| `builder` | `pnpm build` en mode `standalone` (`NEXT_OUTPUT_STANDALONE=true`) |
| `runner` | Image finale : serveur autonome, `public/` avec modèles et moteur, utilisateur non root |

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
  identifiants, longueurs, email, politique de mot de passe, URL d'image,
  espèce et langue.
- **Connexion** : même message et même temps de réponse, que le pseudo existe
  ou non (pas d'énumération des comptes). Les formulaires de connexion et
  d'inscription sont en `method="post"` : jamais de mot de passe dans l'URL.
- **Upload** : JPEG, PNG, WebP ou GIF uniquement (ni HTML ni SVG), 4 Mo
  maximum, nom de fichier nettoyé, suffixe aléatoire.
- **Intégrité** : suppressions en transaction ; les commentaires orphelins sont
  refusés à la création et ignorés à la lecture.
- **Redirections** : après connexion, retour seulement vers un chemin interne
  (`safeNext`).
- **Traduction** : modèles servis par le site, aucun texte envoyé à un tiers.
- **En-têtes HTTP** : `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` ; pas de `X-Powered-By`.
- **Secrets** : `.env*` ignorés par git (racine et application) et exclus de
  l'image Docker.
- **Dépendances** : `pnpm audit`, Dependabot (délai de 7 jours), CodeQL.
  L'alerte `braces` (GHSA-vfj7-8cjw-p6xm) ne concerne que l'outillage de lint
  (`@next/eslint-plugin-next`) et n'a pas de version corrigée.

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
| **Prisma** | 6.x (`^6.19.3`) | Prisma 7 ne prend pas en charge MongoDB, et Prisma 8 (réécriture MongoDB) n'existe qu'en pré-version. Les majeures sont bloquées dans Dependabot. |
| **deepmerge-ts** | 8.x (override) | Prisma 6 fige la 7.1.5, vulnérable. La 8.x est forcée via `pnpm.overrides` (vérifiée avec `prisma validate` et `generate`). À retirer quand Prisma l'embarquera. |
| **TypeScript** | 6.x | `@typescript-eslint/parser` n'accepte pas TypeScript 7 (`<6.1.0`). |
| **Transformers.js** | 4.x | Exécute les modèles Opus-MT dans le navigateur. Le script d'installation de sa dépendance Node `onnxruntime-node` est ignoré par pnpm : elle ne sert qu'hors du navigateur. |
| **Node.js** | 24 LTS | Version de la CI et de l'image Docker ; les majeures de l'image sont bloquées dans Dependabot. |
| **pnpm** | 10.x | Fixée par `packageManager` dans `package.json`. |
| **MongoDB** | 8.0 | Branche stable à support long. |
