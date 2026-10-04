/**
 * Toutes les URL de l'application, au meme endroit.
 * Aucun chemin ne doit etre ecrit en dur dans un <Link>, un href ou un router.push.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  feed: "/feed",
  articles: "/articles",
  article: (id: string) => `/articles/${id}`,
  newArticle: "/articles/new",
  myArticles: "/my-articles",
  profile: "/profile",
  activity: "/activity",
  comments: "/comments",
  dashboard: "/dashboard",
} as const;

/** Endpoints de l'API REST. */
export const API = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  users: "/api/users",
  user: (id: string) => `/api/users/${id}`,
  articles: "/api/articles",
  articlesByAuthor: (authorId: string) => `/api/articles?authorId=${encodeURIComponent(authorId)}`,
  article: (id: string) => `/api/articles/${id}`,
  articleViews: (id: string) => `/api/articles/${id}/views`,
  articleLike: (id: string) => `/api/articles/${id}/like`,
  articleDislike: (id: string) => `/api/articles/${id}/dislike`,
  comments: "/api/comments",
  commentsByArticle: (articleId: string) => `/api/comments?articleId=${encodeURIComponent(articleId)}`,
  uploads: (filename: string) => `/api/uploads?filename=${encodeURIComponent(filename)}`,
} as const;
