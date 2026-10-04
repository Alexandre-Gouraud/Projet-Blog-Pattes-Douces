import { API } from "./routes";
import type { Article, ArticleWithComments, Comment, CurrentUserResponse } from "./api-types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || "Erreur reseau");
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

export function register(payload: { pseudo: string; mail: string; biographie?: string; password: string }) {
  return request<{ message: string }>(API.register, postJson(API.register, payload));
}

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

export function createArticle(payload: { titre: string; texte: string; userId: string; imageUrl?: string }) {
  return request<{ message: string }>(API.articles, postJson(API.articles, payload));
}

export function deleteArticle(id: string) {
  return request<{ success: boolean }>(API.article(id), { method: "DELETE" });
}

export function addView(articleId: string, userId: string) {
  return request<{ success: boolean }>(API.articleViews(articleId), postJson("", { userId }));
}

export function likeArticle(articleId: string, userId: string) {
  return request<Article>(API.articleLike(articleId), postJson("", { userId }));
}

export function dislikeArticle(articleId: string, userId: string) {
  return request<Article>(API.articleDislike(articleId), postJson("", { userId }));
}

/* --- Commentaires --- */

export function fetchComments(articleId?: string) {
  return request<Comment[]>(articleId ? API.commentsByArticle(articleId) : API.comments);
}

/** Commentaires ecrits par l'utilisateur. */
export function fetchCommentsByCommenter(userId: string) {
  return request<Comment[]>(API.commentsByCommenter(userId));
}

/** Commentaires recus sur les articles de l'utilisateur. */
export function fetchCommentsOnAuthorArticles(authorId: string) {
  return request<Comment[]>(API.commentsOnAuthorArticles(authorId));
}

export function createComment(payload: { id_article: string; texte: string; commentataireId: string }) {
  return request<Comment>(API.comments, postJson(API.comments, payload));
}

/* --- Upload --- */

export async function uploadImage(file: File): Promise<{ url: string }> {
  return request<{ url: string }>(API.uploads(file.name), { method: "POST", body: file });
}
