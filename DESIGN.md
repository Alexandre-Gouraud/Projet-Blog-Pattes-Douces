# DESIGN.md — Pattes Douces

> Système de design de **Pattes Douces**, le blog communautaire où les animaux de compagnie (et leurs humains) publient, commentent et réagissent.
> Version : 2.0 — octobre 2026 · Prototype de référence : `Pattes Douces.dc.html`
> Référentiels : **RGAA 4.1.2** et **WCAG 2.2**, niveau **AA**.

---

## Sommaire

1. Principes
2. Identité de marque
3. Couleurs et thèmes
4. Typographie
5. Espacement, formes et élévation
6. Mise en page et responsive
7. Iconographie et imagerie
8. Mouvement
9. Composants
10. États de l'interface
11. Internationalisation (i18n) et RTL
12. Contenus et ton éditorial
13. Accessibilité : exigences RGAA / WCAG
14. Recette accessibilité (checklist)
15. Inventaire des écrans
16. Correspondance avec l'audit de l'ancienne version

---

## 1. Principes

| # | Principe | Ce que cela implique |
|---|---|---|
| 1 | **Fidélité à la marque** | On conserve le logo, le dégradé abricot → caramel, l'accent `#FFB371`, le brun `#996C44`, les gris `#E5E5E1` / `#D9D9D9` et la police Inter. |
| 2 | **Une seule interface** | Le même shell (barre latérale, barre supérieure, tiroir mobile) sur toutes les pages, y compris l'accueil public et la page 404. |
| 3 | **Le dégradé sert de décor, pas de support de lecture** | Tout texte courant est posé sur une surface (carte). Seuls les titres d'au moins 24 px en gras sont posés directement sur le dégradé. |
| 4 | **Une action principale par vue** | Hiérarchie stricte : primaire, secondaire, danger. |
| 5 | **Rien de factice** | Chaque contrôle visible fonctionne : recherche, thème, langue, menu. |
| 6 | **Accessible par défaut** | Chaque composant respecte les critères AA dès sa conception (voir §13). |
| 7 | **Chaleureux et clair** | Ton familier et un peu drôle, mais des consignes et des erreurs toujours explicites. |

---

## 2. Identité de marque

- **Nom** : Pattes Douces.
- **Logo** : chat dessiné au trait noir sur fond blanc (`assets/logo.png`, 320 × 320). Il est toujours posé sur une pastille blanche arrondie, y compris en thème sombre, pour préserver son contraste.
  - Tailles : 44 px dans la barre latérale, 36 px dans les barres, 80 à 112 px dans les états vides, la 404 et le bandeau d'accueil.
  - Le logo est accompagné du nom « Pattes Douces » en texte réel. L'image est donc décorative (`alt=""`) : le lien porte le texte.
- **Signature visuelle** : le dégradé horizontal abricot → caramel en fond de la zone de contenu.

---

## 3. Couleurs et thèmes

### 3.1 Architecture

Toutes les couleurs d'interface passent par des **variables CSS** définies sur `:root`. Le thème est appliqué en remplaçant ces variables. Les composants n'utilisent jamais de couleur codée en dur, sauf pour les couleurs de marque invariantes (bouton primaire, graphiques).

### 3.2 Jetons sémantiques

| Variable | Rôle | Clair | Sombre |
|---|---|---|---|
| `--app` | Fond du shell (barre latérale, barres) | `#E5E5E1` | `#1C1815` |
| `--surface` | Cartes, champs, menus, pied de page | `#FFFFFF` | `#28211C` |
| `--ink` | Texte principal, titres, icônes de contrôle | `#1F140B` | `#F5EDE4` |
| `--ink2` | Texte secondaire | `#4A3B2E` | `#DCCFC2` |
| `--ink3` | Métadonnées (dates, compteurs) | `#6B5A4B` | `#C2B1A2` |
| `--cream` | Blocs internes (commentaires, états vides) | `#FFF8F1` | `#332A23` |
| `--form` | Carte des formulaires | `#D9D9D9` | `#352D26` |
| `--link` | Liens | `#7A5232` | `#FFB371` |
| `--icon` | Icônes de navigation | `#7A5232` | `#FFB371` |
| `--brand` | Bordures de champs, boutons secondaires | `#996C44` | `#C9925F` |
| `--tint` | Survol, élément sélectionné | `#FFF1E4` | `#4A3829` |
| `--danger` | Texte et bordures destructifs ou d'erreur | `#B3261E` | `#FF8A80` |
| `--danger-bg` | Fond des messages d'erreur | `#FDECEA` | `#4A2420` |
| `--danger-ink` | Texte des messages d'erreur | `#8C1D18` | `#FFC9C3` |
| `--sk1` / `--sk2` | Squelettes de chargement, pistes de barres | `#EFE7DE` / `#F4EEE7` | `#3A3029` / `#322923` |
| `--line` | Séparateurs | `rgba(31,20,11,.12)` | `rgba(245,237,228,.14)` |
| `--line-strong` | Contour des pastilles de réaction | `rgba(31,20,11,.25)` | `rgba(245,237,228,.35)` |
| `--grad` | Fond de la zone de contenu | `linear-gradient(90deg, hsl(28 100% 72%), hsl(28 38% 43%))` | `linear-gradient(90deg, hsl(28 42% 26%), hsl(28 30% 13%))` |

### 3.3 Couleurs invariantes (identiques dans les deux thèmes)

| Couleur | Usage |
|---|---|
| `#FFB371` + texte `#1F140B` | Bouton primaire |
| `#996C44` + texte `#FFFFFF` | Survol du bouton primaire |
| `#B3261E` + texte `#FFFFFF` | Bouton de confirmation destructive (dialogue) |
| `#3D8B40` / `#D93A2B` / `#7C4DFF` / `#996C44` | Graphiques : j'aime / je n'aime pas / commentaires / vues |
| Avatars : `#FFB371`, `#996C44` (texte blanc), `#D9D9D9`, `#F6D2B0` | Une couleur par membre |

> Le bleu (likes, bouton commentaire) et le rouge de « Créer un article » de l'ancienne version sont supprimés. Le rouge est réservé aux erreurs et aux suppressions.

### 3.4 Contrastes vérifiés (WCAG 1.4.3, 1.4.11 / RGAA 3.2, 3.3)

Seuils : **4,5 : 1** pour le texte courant, **3 : 1** pour le texte d'au moins 24 px (ou 18,66 px en gras) et pour les composants d'interface.

| Combinaison | Thème | Ratio ≈ | Statut |
|---|---|---|---|
| `#1F140B` sur `#FFB371` (bouton primaire) | les deux | 11 : 1 | ✔ AA (l'ancien blanc sur orange faisait 1,9 : 1 ✘) |
| `#FFFFFF` sur `#996C44` (survol primaire) | les deux | 4,6 : 1 | ✔ AA |
| `--ink` sur `--surface` | clair | 17 : 1 | ✔ AAA |
| `--ink` sur `--surface` | sombre | 14 : 1 | ✔ AAA |
| `--ink3` sur `--surface` | clair | 6,5 : 1 | ✔ AA |
| `--ink3` sur `--surface` | sombre | 7,3 : 1 | ✔ AAA |
| `--link` sur `--surface` | clair | 7 : 1 | ✔ AA |
| `--link` sur `--surface` | sombre | 9 : 1 | ✔ AAA |
| `--link` sur `--app` (`#7A5232` sur `#E5E5E1`) | clair | 5,6 : 1 | ✔ AA |
| `--ink` sur l'extrémité sombre de `--grad` | clair | 4 : 1 | ✔ grand texte uniquement |
| `--ink` sur `--grad` | sombre | ≥ 8 : 1 | ✔ AA |
| `--danger` sur `--surface` | clair / sombre | 6,5 : 1 / 6,8 : 1 | ✔ AA |
| `--danger-ink` sur `--danger-bg` | clair / sombre | 7,9 : 1 / 8,5 : 1 | ✔ AA |
| Bordure `--brand` sur `--surface` | clair / sombre | 4,6 : 1 / 5,7 : 1 | ✔ composant (≥ 3 : 1) |
| Bordure `--brand` sur `--form` | clair | 3,2 : 1 | ✔ composant |
| Contour de focus `--ink` sur toutes les surfaces | les deux | ≥ 4 : 1 | ✔ (2.4.7 / 2.4.13) |

**Règles d'usage**

- Jamais de texte de moins de 24 px directement sur `--grad`.
- Jamais d'information portée par la couleur seule (WCAG 1.4.1 / RGAA 3.1). Un état passe toujours par une icône, un texte et un attribut ARIA (`aria-pressed`, `aria-current`, « Erreur : »).
- Placeholders en `--ink3` (contraste ≥ 4,5 : 1). Un placeholder ne remplace jamais un label.

---

## 4. Typographie

### 4.1 Familles

| Langue | Police | Repli |
|---|---|---|
| Latin (FR, EN) | **Inter** 400 / 500 / 600 / 700 | `system-ui, sans-serif` |
| Arabe | **Noto Sans Arabic** 400 / 600 / 700 | `system-ui` |
| Chinois simplifié | PingFang SC, Microsoft YaHei, Noto Sans SC (polices système) | `system-ui` |

Pile complète : `Inter, 'Noto Sans Arabic', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif`.

### 4.2 Échelle

| Rôle | Desktop | Mobile | Graisse | Interligne |
|---|---|---|---|---|
| Titre de page (h1) | 32 px | 26 px | 700, interlettrage −0,02 em | 1,15 |
| Titre de section (h2) | 22–24 px | 22 px | 700 | 1,25 |
| Titre de carte | 20 px | 20 px | 650 | 1,3 |
| Corps d'article | 18 px | 18 px | 400 | 1,7, mesure ≤ 68 caractères |
| Corps | 16 px | 16 px | 400 | 1,55 |
| Libellé, navigation, bouton | 15 px | 15–16 px | 600 | 1,25 |
| Métadonnées | 14 px | 14 px | 400–500 | 1,4 |

### 4.3 Règles

- Taille minimale : **14 px**, réservée aux métadonnées. Le texte courant fait au moins 16 px.
- Le texte reste lisible à **200 % de zoom** sans perte de contenu (WCAG 1.4.4 / RGAA 10.4).
- Le texte supporte l'**espacement augmenté** : interligne 1,5, paragraphes 2×, lettres 0,12 em, mots 0,16 em. Aucune hauteur fixe sur les boîtes de texte (WCAG 1.4.12 / RGAA 10.12).
- `text-wrap: pretty` sur les paragraphes et `balance` sur les titres d'article.
- Pas de texte en image, pas de justification, pas de majuscules forcées sur de longs textes.

---

## 5. Espacement, formes et élévation

- **Grille 4 px** : 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 64.
- **Rayons** : 8 px (éléments de menu), 10 px (champs, boutons), 12 px (blocs internes, menus), 16 px (cartes), 999 px (pastilles, avatars).
- **Ombres** (une seule famille, teintée brun) :
  - `sm` : `0 1px 2px rgba(31,20,11,.08)`
  - `md` : `0 1px 2px rgba(31,20,11,.06), 0 8px 24px rgba(31,20,11,.10)` pour les cartes
  - `lg` : `0 24px 48px rgba(31,20,11,.25)` pour les menus, le tiroir et les dialogues
- **Bordures** : cartes sans bordure ; séparateurs 1 px en `--line`.

---

## 6. Mise en page et responsive

### 6.1 Points de rupture

| Largeur | Disposition |
|---|---|
| **≥ 860 px** | Barre supérieure collante (60 px) avec bouton burger. Barre latérale collante de 260 px, pleine hauteur, repliable. Contenu centré, max. 960 px, marges de 40 à 48 px. |
| **< 860 px** | Barre supérieure collante : burger, logo et nom, thème, langue, avatar. Navigation dans un tiroir modal. Une colonne, marges de 16 px. |

### 6.2 Structure (landmarks)

```
[Lien d'évitement « Aller au contenu »]
<aside id="barre-laterale">  → logo · <nav "Navigation principale"> · thème · langue · compte
<header>                     → burger · (logo si barre repliée) · thème · langue · profil
<main id="contenu" tabindex="-1">  → un seul <h1>
<footer>                     → © · <nav "Liens de pied de page">
```

### 6.3 Règles

- **Reflow** : aucun défilement horizontal à 320 px de large ni à 400 % de zoom (WCAG 1.4.10 / RGAA 10.11). Seul le tableau de statistiques peut défiler horizontalement, dans son conteneur.
- Grilles en `repeat(auto-fit, minmax(…))`, flex avec `flex-wrap` et `gap`.
- Le fond de la barre latérale couvre toujours toute la hauteur de l'écran.
- L'ordre du DOM suit l'ordre visuel (WCAG 1.3.2 / RGAA 10.3).

---

## 7. Iconographie et imagerie

- **Icônes** : trait de 1,75 à 2 px, 18 à 24 px, extrémités arrondies, style Heroicons/Lucide.
  - Toujours `aria-hidden="true"`, avec un texte visible ou masqué qui donne le sens.
  - Couleur en `currentColor`, pour suivre le thème et les états.
- **Thème animalier** : chaque membre a un avatar (initiale sur sa couleur) et son espèce est affichée (Chat, Chien, Lapine, Chatonne…). Le logo apparaît en grand dans le bandeau d'accueil, les états vides et la 404.
- **Photos** : prévoir des emplacements (vignette d'article, en-tête de profil) pour `cat.webp`, `sassycat.webp` et `background-blog.jpg`.
  - Chaque image porteuse d'information a une alternative pertinente (RGAA 1.2, 1.3).
  - L'auteur est invité à décrire son image dans le texte (aide du champ « Image »).
- **Drapeaux** : images décoratives (`alt=""` ou `aria-hidden`). Le nom de la langue est toujours écrit en toutes lettres.

---

## 8. Mouvement

| Animation | Détail |
|---|---|
| Bouton burger | Rotation de 180° et passage burger ↔ croix, 0,4 s, courbe `cubic-bezier(.34,1.4,.64,1)` |
| Bouton de thème | Rotation de 360° et passage lune ↔ soleil, 0,5 s, même courbe |
| Survols | Changement de fond instantané |

**Règles**

- `prefers-reduced-motion: reduce` désactive toutes les transitions et animations (WCAG 2.3.3).
- Aucune animation automatique de plus de 5 secondes, aucun clignotement (WCAG 2.2.2, 2.3.1 / RGAA 13.8).
- Les squelettes de chargement sont statiques.

---

## 9. Composants

> Toutes les cibles interactives mesurent au moins **44 × 44 px** (WCAG 2.5.8 exige 24 px ; 2.5.5 AAA en recommande 44).

### 9.1 Boutons

| Variante | Apparence | Usage |
|---|---|---|
| **Primaire** | Fond `#FFB371`, texte `#1F140B`, 600. Survol : fond `#996C44`, texte blanc. | Se connecter, Publier, Écrire un article, Créer mon compte |
| **Secondaire** | Contour 1,5 px `--brand`, fond `--surface`, texte `--ink`. Survol : `--tint`. | Retour, Annuler, Se déconnecter, Lire |
| **Danger** | Contour et texte `--danger`. Survol : `--danger-bg`. | Supprimer l'article, Supprimer le compte |
| **Danger plein** | Fond `#B3261E`, texte blanc | Confirmation dans le dialogue uniquement |
| **Icône** | 44 × 44, transparent, icône `--ink` | Burger, fermer, thème |

**Règles**

- Élément `<button>` pour les actions, `<a>` pour la navigation.
- Le libellé est explicite hors contexte. Si plusieurs boutons portent le même libellé visible (« Lire », « Supprimer »), un texte masqué précise l'article concerné (RGAA 6.1 / WCAG 2.4.4).
- Le nom accessible contient le libellé visible (WCAG 2.5.3).
- `white-space: nowrap` et `max-width: 100%` : dans une rangée, les boutons passent à la ligne entiers, sans être coupés.

### 9.2 Barre latérale (desktop)

- Logo, puis `<nav aria-label="Navigation principale">` en liste `<ul>`, puis thème et langue, puis bloc compte (avatar, pseudo, espèce, « Se déconnecter ») ou « Se connecter » et « Créer un compte ».
- Élément actif : fond `--surface`, graisse 650, `aria-current="page"`.
- **Repliable** : bouton burger dans la barre supérieure, avec `aria-expanded` et `aria-controls="barre-laterale"`. Son libellé alterne entre « Ouvrir le menu » et « Fermer le menu ». Repliée, la barre supérieure reprend logo, langue, thème et profil.

### 9.3 Tiroir de navigation (mobile)

- `role="dialog"`, `aria-modal="true"`, `aria-label="Menu"`.
- À l'ouverture, le focus va sur « Fermer le menu ». `Échap`, le bouton ou un clic sur le voile le ferment, et le focus revient au burger.

### 9.4 Sélecteur de langue

- Bouton : drapeau, nom de la langue courante (desktop) et chevron, ou drapeau seul (mobile). Le texte masqué « Changer de langue » complète le nom accessible. `aria-expanded` et `aria-controls`.
- Menu : liste de 4 boutons. Chacun affiche un drapeau, le nom de la langue **écrit dans cette langue**, avec l'attribut `lang` correspondant (RGAA 8.7). La langue active porte `aria-current="true"`, un fond `--tint` et une coche.
- Fermeture : sélection, `Échap` (le focus revient au bouton) ou clic à l'extérieur. Un message de statut confirme le changement.

### 9.5 Bouton de thème

- Bouton icône lune (thème clair) ou soleil (thème sombre), avec `aria-pressed` et le libellé « Mode sombre ».
- Le choix est mémorisé (`localStorage`). Par défaut, il suit `prefers-color-scheme`.

### 9.6 Carte article

Structure : avatar, pseudo, espèce et date (`<time>`), puis titre (h2 contenant un lien), puis extrait, puis barre d'actions.

- **Barre d'actions** :
  - vues (icône et nombre, mot « vues » en texte masqué) ;
  - J'aime et Je n'aime pas : pastilles avec `aria-pressed` et nom accessible « J'aime (3) » ;
  - lien vers les commentaires, avec texte masqué « sur « titre » ».
- **État réagi** : fond `--tint` et bordure `--brand`. Le changement est perceptible même sans la couleur, grâce à `aria-pressed` et à la variation de contour.
- **Une seule variante dans tout le site.** Dans « Mes articles », la carte reçoit en pied les actions « Lire » et « Supprimer ».

### 9.7 Détail d'article

- Bouton « Retour aux articles » (sa flèche s'inverse en RTL).
- Carte : h1, auteur, corps à 18 px, réactions.
- Section « Commentaires (n) » : liste `<ul>` de blocs `--cream`, puis formulaire avec un label visible. Pour un visiteur : « Connectez-vous pour commenter et réagir ».

### 9.8 Formulaires

- Carte `--form`, rayon 16 px, largeur max. 460 px (640 px pour la rédaction d'article).
- Mention des champs obligatoires en tête : « Les champs marqués d'un astérisque (*) sont obligatoires » (RGAA 11.10).
- Chaque champ comporte :
  - un `<label for>` visible au-dessus ;
  - un champ `--surface` à bordure `--brand`, d'au moins 48 px de haut ;
  - une aide liée par `aria-describedby` (format attendu, longueur minimale).
- `autocomplete` renseigné : `username`, `current-password`, `email`, `new-password` (WCAG 1.3.5 / RGAA 11.13).
- **Erreurs** (WCAG 3.3.1, 3.3.3 / RGAA 11.10, 11.11) :
  - message texte préfixé « Erreur : », en `--danger`, relié au champ par `aria-describedby` ;
  - bordure du champ en `--danger` et `aria-invalid="true"` ;
  - le focus va sur le premier champ en erreur ;
  - à la connexion, un bloc `role="alert"` affiche le message avec une icône.
- Validation à la soumission uniquement : aucune erreur affichée pendant la saisie.
- Les messages ne révèlent pas d'information sensible (« Pseudo ou mot de passe incorrect »).

### 9.9 Recherche

- Conteneur `role="search"`, label masqué « Rechercher un article », `type="search"`.
- Le résultat est annoncé dans une zone `role="status"` (« 2 articles trouvés »), conformément à WCAG 4.1.3.

### 9.10 Tuiles et graphiques de statistiques

- Tuiles : valeur à 32 px / 700 et libellé. La liste `<ul>` place le libellé avant la valeur dans le DOM.
- Anneau j'aime / je n'aime pas : `role="img"` avec une alternative chiffrée complète. La légende indique les valeurs et les pourcentages.
- Barres horizontales : valeurs écrites à côté de chaque barre.
- Le tableau « Détail par article » est l'alternative textuelle complète : `<caption>`, `<th scope="col">` et `<th scope="row">` (RGAA 5.4, 5.6, 5.7).

### 9.11 Retours système

| Composant | Rôle ARIA | Usage |
|---|---|---|
| Message temporaire (« toast ») | `role="status"`, `aria-live="polite"` | Confirmations : publié, connecté, langue changée. Affiché 4 s, en bas au centre. |
| Alerte de formulaire | `role="alert"` | Erreur de connexion |
| Dialogue de confirmation | `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby` | Suppression d'article ou de compte. Le focus va sur « Annuler » ; `Échap` ferme. |

Les `alert()` natifs du navigateur sont supprimés.

### 9.12 Pied de page

- Fond `--surface`, © 2026, `<nav aria-label="Liens de pied de page">` : À propos, Contact, Confidentialité, et **Accessibilité : partiellement conforme**.
- La mention d'état de conformité est obligatoire au sens du RGAA ; le lien mène à la déclaration d'accessibilité.

### 9.13 Page 404

Intégrée au shell : logo, h1 « Page introuvable », texte, bouton primaire « Retour au fil d'actualité ».

---

## 10. États de l'interface

| État | Traitement |
|---|---|
| **Chargement** | Squelettes de cartes sur le fil, le détail d'article et « Mes articles ». `aria-busy="true"` et texte masqué « Chargement des articles… ». Squelettes en `--sk1` / `--sk2`. |
| **Vide** | Bloc `--cream` avec une phrase chaleureuse et une action primaire. Exemples : « Vous n'avez encore rien publié » avec le bouton « Écrire mon premier article » ; « Aucun article ne correspond à… ». |
| **Erreur de formulaire** | Voir §9.8 |
| **Page protégée** | Redirection vers Connexion avec le message « Connectez-vous pour accéder à cette page » (`role="status"`). |
| **Visiteur qui réagit** | Message temporaire « Connectez-vous pour réagir aux articles ». |
| **Sélectionné / actif** | Fond `--tint` ou `--surface` avec `aria-pressed` ou `aria-current`. |
| **Focus** | Contour de 3 px en `--ink`, décalage de 2 px, sur tous les éléments interactifs. |
| **Désactivé** | Aucun bouton désactivé : on laisse soumettre et on explique l'erreur. |

---

## 11. Internationalisation (i18n) et RTL

| Langue | Code | Drapeau | Sens |
|---|---|---|---|
| Français (par défaut) | `fr` | France | LTR |
| English | `en` | Royaume-Uni | LTR |
| العربية | `ar` | Ligue arabe | **RTL** |
| 中文 (mandarin, chinois simplifié) | `zh` | Chine | LTR |

**Règles**

- `lang` et `dir` sont mis à jour sur `<html>` à chaque changement (RGAA 8.3 / WCAG 3.1.1). Le choix est mémorisé.
- Le titre du document (`<title>`) est traduit : « {titre de page} – Pattes Douces » (RGAA 8.6 / WCAG 2.4.2).
- **Contenus des membres** (articles, commentaires) : ils restent dans leur langue d'origine et portent leur propre attribut `lang` (RGAA 8.7 / WCAG 3.1.2). Un nouvel article prend la langue de l'interface au moment de sa rédaction.
- **RTL** : uniquement des propriétés logiques (`margin-inline-start`, `inset-inline-start/end`, `border-inline-end`, `text-align: start/end`). Les icônes directionnelles, comme la flèche retour, sont inversées.
- **Pluriels et formats** : les textes dynamiques (« 3 commentaires », « 2 articles trouvés ») sont des fonctions par langue. Pas de concaténation figée.
- Les guillemets suivent la langue : « » (fr), “ ” (en), « » (ar), 「」 (zh).
- Les libellés doivent supporter environ +35 % de longueur (allemand, arabe) sans casser la mise en page.

---

## 12. Contenus et ton éditorial

- **Ton** : chaleureux, familier, un brin d'humour animalier (« Le chat l'a peut-être fait tomber de la table »). L'humour n'entrave jamais une consigne.
- **Libellés** : verbes d'action (« Publier », « Se connecter »), aucun anglicisme dans la version française.
- **Messages d'erreur** : ils disent ce qui ne va pas et comment corriger (« le mot de passe doit contenir au moins 8 caractères »).
- **Liens** : leur intitulé a du sens seul ou dans son contexte immédiat ; jamais « cliquez ici ».
- **Dates** : élément `<time>`, format local `JJ/MM/AAAA`.

---

## 13. Accessibilité : exigences RGAA / WCAG

Niveau visé : **WCAG 2.2 AA**, soit le **RGAA 4.1.2** (106 critères).

| Thème RGAA | Critères clés | Exigences dans Pattes Douces |
|---|---|---|
| **1. Images** | 1.1–1.3 · WCAG 1.1.1 | Logo, drapeaux et icônes décoratifs : `alt=""` ou `aria-hidden`. Graphiques : `role="img"` avec alternative chiffrée. |
| **2. Cadres** | 2.1 | Aucun iframe. |
| **3. Couleurs** | 3.1–3.3 · WCAG 1.4.1, 1.4.3, 1.4.11 | Contrastes du §3.4 ; information jamais portée par la couleur seule. |
| **4. Multimédia** | 4.x | Aucun média ; prévoir sous-titres et transcription si des vidéos arrivent. |
| **5. Tableaux** | 5.4–5.7 | `<caption>` et `<th scope>`. Pas de tableau de mise en page. |
| **6. Liens** | 6.1–6.2 · WCAG 2.4.4 | Intitulés explicites, textes masqués de contexte pour les liens et boutons répétés. |
| **7. Scripts** | 7.1–7.5 · WCAG 4.1.2, 4.1.3 | Composants ARIA conformes (`aria-expanded`, `aria-pressed`, `aria-current`, `aria-modal`). Messages de statut annoncés. |
| **8. Éléments obligatoires** | 8.3, 8.4, 8.6, 8.7 · WCAG 3.1.1, 3.1.2, 2.4.2 | `lang` et `dir` dynamiques, titre de page pertinent, changements de langue balisés. |
| **9. Structuration** | 9.1–9.3 · WCAG 1.3.1 | Un h1 par vue, hiérarchie h1 → h2 sans saut. Landmarks. Listes `<ul>` pour la navigation, les cartes et les commentaires. |
| **10. Présentation** | 10.4, 10.7, 10.11–10.14 · WCAG 1.4.4, 1.4.10, 1.4.12, 2.4.7, 2.4.11 | Zoom 200 %, reflow à 320 px, espacement de texte, focus visible et jamais masqué par les barres collantes. |
| **11. Formulaires** | 11.1, 11.2, 11.10, 11.11, 11.13 · WCAG 1.3.5, 3.3.1–3.3.3, 3.3.7 | Labels visibles, champs obligatoires signalés, erreurs explicites et reliées, `autocomplete`, aucune ressaisie demandée inutilement. |
| **12. Navigation** | 12.1, 12.6–12.9 · WCAG 2.1.1, 2.1.2, 2.4.1, 2.4.3 | Lien d'évitement, ordre de tabulation logique, aucun piège clavier. `Échap` ferme le tiroir, le menu et le dialogue, puis le focus revient au déclencheur. Après chaque navigation, le focus va sur `<main>`. |
| **13. Consultation** | 13.1, 13.8 · WCAG 2.2.1, 2.2.2, 2.3.3 | Aucune limite de temps ; les messages temporaires ne contiennent aucune action indispensable. Mouvement réduit respecté. |

**Critères WCAG 2.2 ajoutés**

| Critère | Application |
|---|---|
| **2.4.11 Focus non masqué** | Les barres collantes ne recouvrent pas l'élément qui a le focus (marges de défilement). |
| **2.5.7 Mouvements de glissement** | Aucune interaction ne repose sur un glisser. |
| **2.5.8 Taille de cible** | Au moins 44 px partout. |
| **3.2.6 Aide cohérente** | Les liens Contact et Accessibilité sont au même endroit sur toutes les pages. |
| **3.3.7 Saisie redondante** | Aucune information n'est redemandée. |
| **3.3.8 Authentification accessible** | Mot de passe collable, gestionnaires de mots de passe compatibles (`autocomplete`), pas de test cognitif. |

---

## 14. Recette accessibilité (checklist)

### Outils

- **Analyse automatique** : axe DevTools, WAVE, Lighthouse (score visé : 100).
- **Contraste** : Colour Contrast Analyser, sur les deux thèmes.
- **Lecteurs d'écran** : NVDA + Firefox, JAWS + Chrome, VoiceOver sur macOS et iOS, TalkBack sur Android.
- **Navigation clavier seule** sur l'ensemble du parcours.

### Scénarios à valider dans les 4 langues et les 2 thèmes

1. Lien d'évitement, puis navigation principale au clavier (`aria-current` annoncé).
2. Repli et dépli de la barre latérale (`aria-expanded` annoncé), puis tiroir mobile (focus capturé, `Échap`).
3. Changement de langue : nom de chaque langue prononcé dans sa langue ; arabe affiché en RTL.
4. Bascule de thème (`aria-pressed` annoncé) et contrastes vérifiés.
5. Connexion avec erreur : alerte lue et focus sur le pseudo. Puis connexion réussie avec message de statut.
6. Inscription avec 4 erreurs : chaque message est relié à son champ.
7. Réaction J'aime (état pressé annoncé), puis commentaire publié (statut annoncé).
8. Suppression : le dialogue prend le focus, `Annuler` ou `Échap` fonctionnent, puis le focus revient.
9. Zoom à 200 % et à 400 %, largeur de 320 px, espacement de texte augmenté.
10. Mouvement réduit activé : plus aucune rotation.

### Livrables

- Déclaration d'accessibilité.
- Schéma pluriannuel de mise en accessibilité.
- Grille d'audit RGAA remplie sur l'échantillon d'écrans ci-dessous.

---

## 15. Inventaire des écrans

| Écran | Accès | États couverts |
|---|---|---|
| Accueil / fil | public | bandeau visiteur, recherche, chargement, aucun résultat |
| Détail d'article | public | chargement, commentaires, invitation à se connecter |
| Connexion | public | redirection protégée, erreur |
| Inscription | public | validations |
| Écrire un article | membre | validations |
| Mes articles | membre | vide, suppression |
| Profil | membre | suppression de compte |
| Activité et historique | membre | vides |
| Statistiques | membre | vide, graphiques, tableau |
| 404 | public | — |

**Comptes de démo** : Moustache, Caramel, Plume — mot de passe `patte`.

**Réglages de démo (Tweaks)** : simuler le chargement, démarrer connecté, compte neuf (états vides).

---

## 16. Correspondance avec l'audit de l'ancienne version

| # | Problème d'origine | Résolution |
|---|---|---|
| 1 | Mobile cassé (barre latérale fixe) | Barre supérieure et tiroir sous 860 px, une seule colonne |
| 2 | Deux navigations différentes | Shell unique |
| 3 | Deux styles de cartes | Une seule carte article |
| 4 | Boutons sans hiérarchie | Primaire, secondaire, danger |
| 5 | Contrastes faibles | Texte sombre sur orange, texte courant sur surfaces, ratios vérifiés |
| 6 | Éléments factices | Recherche, thème et langue fonctionnels ; notifications retirées |
| 7 | Libellés FR/EN mélangés, emoji 🔙 | i18n complet en 4 langues, icônes au trait |
| 8 | Thème animal absent | Avatars, espèces, logo mis en avant |
| 9 | Chargements hétérogènes | Squelettes partout |
| 10 | Barre latérale tronquée | Barre collante pleine hauteur, repliable |
| — | Mode sombre non relié | Thème sombre complet, mémorisé, conforme AA |
| — | `alert()` natifs | Messages de statut ARIA et dialogue modal |
