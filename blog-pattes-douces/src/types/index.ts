/**
 * Types partages, alignes sur le schema Prisma.
 * Les noms de champs restent ceux de la base (francais) tant que la phase 6
 * optionnelle du plan de restructuration n'a pas ete validee.
 */

export type User = {
  id: string;
  pseudo: string;
  email?: string;
  biographie?: string | null;
};

export type ArticleAuthor = Pick<User, "id" | "pseudo">;

export type Article = {
  id: string;
  titre: string;
  texte: string;
  image?: string | null;
  date: string;
  vue: string[];
  reaction1: string[];
  reaction2: string[];
  auteurId: string;
  auteur: ArticleAuthor;
};

export type Comment = {
  id: string;
  texte: string;
  date: string;
  reaction1: string[];
  reaction2: string[];
  article_source: { id: string; titre: string };
  commentataire: ArticleAuthor;
};

export type ArticleWithComments = Article & {
  commentaires: Array<Omit<Comment, "article_source">>;
};
