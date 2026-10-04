/**
 * Evenement emis quand les articles de l'utilisateur changent (suppression...),
 * pour que les blocs affiches sur la meme page (statistiques, listes) se
 * rechargent sans recharger toute la page.
 */
export const ARTICLES_CHANGED_EVENT = "articles:changed";

export function notifyArticlesChanged(): void {
  window.dispatchEvent(new Event(ARTICLES_CHANGED_EVENT));
}
