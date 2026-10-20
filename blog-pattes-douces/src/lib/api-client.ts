import { API } from "./routes";
import type { Article, ArticleWithComments, Comment, CurrentUserResponse, User } from "./api-types";
import type { CurrentUser } from "./auth/session";

/**
 * Erreur d'API : `status` permet a l'interface d'afficher un message traduit
 * (les messages du serveur sont en francais). 0 = reseau indisponible.
 */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError("Erreur reseau", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message || body.error || "Erreur reseau", response.status);
  }
  return response.json() as Promise<T>;
}

function postJson(url: string, body: unknown) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } satisfies RequestInit;
}

/* --- Authentification --- */

export function login(pseudo: string, password: string) {
  return request<CurrentUserResponse>(API.login, postJson(API.login, { pseudo, password }));
}

/** Deconnexion : le serveur detruit la session et efface le cookie. */
export function logout() {
  return request<{ message: string }>(API.logout, { method: "POST" });
}

/** Delai maximal de /api/auth/me : au-dela on ne sait pas, on ne traite pas en visiteur. */
const ME_TIMEOUT_MS = 8000;

/** Utilisateur de la session serveur, ou null si personne n'est connecte. */
export async function fetchMe(): Promise<CurrentUser | null> {
  try {
    const { user } = await request<{ user: CurrentUser }>(API.me, { cache: "no-store", signal: AbortSignal.timeout(ME_TIMEOUT_MS) });
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function register(payload: { pseudo: string; mail: string; biographie?: string; espece?: string; password: string }) {
  return request<{ message: string }>(API.register, postJson(API.register, payload));
}

export function fetchUser(id: string) {
  return request<User>(API.user(id));
}

/** Supprime le compte de la session (le serveur refuse tout autre identifiant). */
export function deleteAccount(userId: string) {
  return request<{ message: string }>(API.user(userId), { method: "DELETE" });
}

/* --- Articles --- */

export function fetchArticles(authorId?: string) {
  return request<Article[]>(authorId ? API.articlesByAuthor(authorId) : API.articles);
}

/** Articles likes ou dislikes par l'utilisateur. */
export function fetchArticlesReactedBy(userId: string) {
  return request<Article[]>(API.articlesReactedBy(userId));
}

export function fetchArticle(id: string) {
  return request<ArticleWithComments>(API.article(id));
}

export function createArticle(payload: {
  titre: string;
  texte: string;
  imageUrl?: string;
  langue?: string;
}) {
  return request<{ message: string; id: string }>(API.articles, postJson(API.articles, payload));
}

export function deleteArticle(id: string) {
  return request<{ success: boolean }>(API.article(id), { method: "DELETE" });
}

export function addView(articleId: string) {
  return request<{ success: boolean }>(API.articleViews(articleId), { method: "POST" });
}

export function likeArticle(articleId: string) {
  return request<Article>(API.articleLike(articleId), { method: "POST" });
}

export function dislikeArticle(articleId: string) {
  return request<Article>(API.articleDislike(articleId), { method: "POST" });
}

/* --- Commentaires --- */

/** Commentaires ecrits par l'utilisateur. */
export function fetchCommentsByCommenter(userId: string) {
  return request<Comment[]>(API.commentsByCommenter(userId));
}

/** Commentaires recus sur les articles de l'utilisateur. */
export function fetchCommentsOnAuthorArticles(authorId: string) {
  return request<Comment[]>(API.commentsOnAuthorArticles(authorId));
}

export function createComment(payload: { id_article: string; texte: string; langue?: string }) {
  return request<Comment>(API.comments, postJson(API.comments, payload));
}

/* --- Upload --- */

export async function uploadImage(file: File): Promise<{ url: string }> {
  return request<{ url: string }>(API.uploads(file.name), { method: "POST", body: file });
}
