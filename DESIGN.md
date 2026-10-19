# DESIGN.md — Pattes Douces (état actuel)

Ce document décrit le design **tel qu'il existe aujourd'hui** dans `blog-pattes-douces/`.
Il sert de point de départ pour une refonte (Claude Design). Rien n'y est inventé :
chaque valeur vient du code ou de l'observation du site en mode dev.

## 1. Le produit

**Pattes Douces** est un blog communautaire sur le thème des **animaux de compagnie** :
les membres (souvent « au nom » de leur animal) publient des articles, commentent,
likent / dislikent, et suivent leurs statistiques.

- Ton : chaleureux, familier, un peu humoristique (« Inscris-toi », « Pattes Douces »).
- Langue : français (quelques libellés restés en anglais : `Login`, `Password`, `Search or type command...`).
- Logo : chat dessiné au trait noir sur fond blanc → [`images/logo.png`](images/logo.png) (320×320).

## 2. Palette

| Rôle | Valeur | Où |
|---|---|---|
| Fond de page | dégradé `linear-gradient(90deg, hsl(28 100% 72%) → hsl(28 38% 43%))` (orange abricot → brun caramel) | `globals.css` `--background` |
| Accent principal | `#FFB371` (orange clair) | boutons Login / Publier / profil, focus ring |
| Brun « marque » | `#996C44` | titres des formulaires, bordures d'inputs, survol des boutons |
| Gris carte formulaire | `#D9D9D9` | fond des cartes login / register / nouvel article |
| Gris interface | `#E5E5E1` / `#E5E5DF` | sidebar et header |
| Texte | `#171717` (foreground), `#444444` (texte secondaire) | global |
| Surfaces de contenu | blanc, `bg-gray-100` (commentaires) | cartes d'articles, commentaires |
| Like | `text-blue-400` | compteurs et icônes |
| Dislike / destructif | `text-red-400`, `bg-red-500` | compteurs, boutons « Supprimer », « Créer un article » |
| Erreur | `text-red-500` | message sous le formulaire de connexion |
| Graphiques | `#4CAF50` (likes), `#F44336` (dislikes), violet (réactions) | dashboard |
| Bouton commentaire | bleu vif (`bg-blue-*`) | page article |

Pas de vrai thème sombre : le bouton « Toggle Dark Mode » n'est relié à rien, et la media query
`prefers-color-scheme: dark` de `globals.css` redéfinit le même dégradé. Seul le `Header`
a des classes `dark:` : quand le système est en mode sombre, la barre de recherche passe en `bg-gray-900`.

## 3. Typographie

- Police : **Inter** (`next/font/google`, chargée dans `app/layout.tsx`). `globals.css` déclare aussi `Arial, Helvetica` pour `body`.
- Titres de page : `text-3xl` / `text-4xl`, `font-bold` (« Articles récents », « Connexion »).
- Titres de carte : `text-xl font-semibold`.
- Métadonnées (date, compteurs) : `text-sm`, `text-gray-400/500`.
- Pas d'échelle typographique formalisée : les tailles sont choisies au cas par cas.

## 4. Formes et élévation

- Arrondis : surtout `rounded-lg` (36 usages) et `rounded` (25), un peu de `rounded-md` / `rounded-full`.
- Ombres : `shadow-md` (20), quelques `shadow-xl` / `shadow-sm`.
- Bordures : cartes « profil / dashboard » avec une bordure noire fine ; cartes du feed sans bordure.

## 5. Mise en page

### Pages publiques (`/`)
`Navbar` horizontale (dégradé brun → gris foncé, liens blancs) → `Banner` blanc avec « *Pattes Douces* » en italique → feed d'articles → footer.

### Application (`/feed`, `/profile`, `/login`… : `AppShell`)
- **Sidebar fixe** de 256 px (`ml-64`) à gauche, fond gris clair : titre « Pattes Douces », 5 liens avec icônes Heroicons (Accueil, Profil, Articles, Activité et Historique, Statistiques), puis Se connecter / Se déconnecter, © en bas.
- **Header** gris : logo, barre de recherche (non fonctionnelle), 3 icônes (mode sombre, notifications, menu utilisateur : non fonctionnelles).
- **Contenu** : `p-8` sur le dégradé orange.
- **Footer** blanc, liens À propos / Contact / Confidentialité / Conditions (pages inexistantes).

### Pages

| Route | Contenu |
|---|---|
| `/` | feed public « Articles récents » |
| `/login`, `/register` | formulaires d'authentification |
| `/feed` | feed « Articles récents » dans l'`AppShell` |
| `/articles/[id]` | détail d'un article, interactions, commentaires |
| `/articles/new` | formulaire « Créer un nouveau post » (titre, texte, image) |
| `/my-articles` | articles de l'utilisateur |
| `/profile` | « Bienvenue sur votre profil : X », derniers articles, statistiques, boutons Se déconnecter / Supprimer le compte |
| `/activity` | deux colonnes : Mes articles / Mes commentaires + Articles likés |
| `/comments` | commentaires de l'utilisateur |
| `/dashboard` | tuiles de stats, graphiques, derniers articles |
| 404 | « Page introuvable », sans shell |

## 6. Composants

| Composant | Description |
|---|---|
| Carte article (feed) | fond blanc, `rounded-lg shadow-md`, pseudo de l'auteur, titre, extrait, « Publié le », compteurs vues 👁 / like 👍 / dislike 👎 |
| Carte article (profil / dashboard) | bordure noire, compteurs textuels « Vues : 0 Like : 3 Dislike : 0 », bouton rouge « Supprimer » dessous |
| Détail article | carte blanche centrée, « Par X – date », bloc Interactions, liste de commentaires (cartes grises), textarea, bouton bleu |
| Formulaire auth / création | carte `#D9D9D9` centrée (`max-w-md`), inputs bordés `#996C44`, bouton pleine largeur `#FFB371` (`#996C44` au survol) |
| Tuiles statistiques | 4 cartes bordées (articles, vues, réactions, commentaires) |
| Graphiques | anneau likes/dislikes + barres horizontales |
| Page 404 | titre brun, texte, bouton `#FFB371` « Retour au fil d'actualité » |
| Alertes | `alert()` natif du navigateur (inscription réussie, commentaire ajouté) |

## 7. États

| État | Implémentation actuelle |
|---|---|
| Chargement du feed / accueil (`ArticleFeed`) | titre « Chargement des articles... » + 3 skeletons `animate-pulse` |
| Chargement Mes articles / Profil / Dashboard (`MyArticlesList`) | même titre + skeletons |
| Chargement d'un article (`ArticleDetail`) | texte brut « Chargement... » |
| Chargement des commentaires (`CommentList`) | texte brut « Chargement des commentaires... » |
| Activité | aucun état de chargement |
| Erreur de connexion | « Pseudo ou mot de passe incorrect » en rouge sous le formulaire |

## 8. Incohérences constatées (à traiter dans la refonte)

1. **Mobile cassé** : la sidebar fixe de 256 px reste affichée, le contenu est écrasé à ~120 px de large et la page déborde horizontalement.
2. **Deux navigations différentes** : la `Navbar` horizontale sur `/` et la sidebar partout ailleurs.
3. **Deux styles de cartes d'article** (ombre sans bordure / bordure noire).
4. **Boutons sans hiérarchie** : orange (`#FFB371`), bleu (commentaire), rouge pour « Supprimer » **et** pour « Créer un article ».
5. **Contraste faible** : texte blanc sur `#FFB371`, titres `#996C44` sur le dégradé orange, lien « Inscris-toi ».
6. **Éléments factices** : recherche, mode sombre, notifications, menu utilisateur, liens du footer.
7. **Libellés mélangés FR / EN** et emoji « 🔙 » comme bouton retour.
8. **Le thème animalier n'apparaît presque pas visuellement** : hors logo et nom, aucune illustration, icône ou motif lié aux animaux. Les images `public/images/cat.webp`, `sassycat.webp`, `cat-default.jpg` et `background-blog.jpg` ne sont utilisées nulle part.
9. **Chargements hétérogènes** : skeletons d'un côté, texte brut de l'autre.
10. **Sidebar trop courte sur les pages longues** : son fond gris s'arrête à la hauteur de la fenêtre, alors que le footer est plus bas.
