import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const ME = "a".repeat(24);
const OTHER = "b".repeat(24);
const ARTICLE = "c".repeat(24);

const { prisma, auth } = vi.hoisted(() => ({
  prisma: {
    article: { findUnique: vi.fn(), deleteMany: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    commentaire: { deleteMany: vi.fn(), create: vi.fn() },
    session: { deleteMany: vi.fn() },
    user: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
  auth: { user: null as { id: string; pseudo: string; espece: string | null } | null },
}));

vi.mock("@/lib/prisma", () => ({ prisma, publicUserSelect: { id: true, pseudo: true, espece: true } }));
// Seule la session est simulee : requireUser, forbidden... gardent leur vraie logique.
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }));
vi.mock("@/lib/auth/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/server")>();
  return {
    ...actual,
    requireUser: async (request: Request) => {
      const crossOrigin = actual.rejectCrossOrigin(request);
      if (crossOrigin) return { response: crossOrigin };
      if (!auth.user) return { response: NextResponse.json({ error: "Connexion requise" }, { status: 401 }) };
      return { user: auth.user };
    },
  };
});

import { DELETE as deleteArticle } from "./articles/[id]/route";
import { POST as createArticle } from "./articles/route";
import { POST as like } from "./articles/[id]/like/route";
import { POST as createComment } from "./comments/route";
import { DELETE as deleteUser } from "./users/[id]/route";

const json = (method: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost:3000/api/x", {
    method,
    headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
    body: JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  auth.user = { id: ME, pseudo: "Pistache", espece: "cat" };
  prisma.$transaction.mockResolvedValue([{ count: 0 }, { count: 1 }, { count: 0 }, { count: 1 }]);
});

describe("without session", () => {
  beforeEach(() => {
    auth.user = null;
  });

  it("answers 401 on every mutating route", async () => {
    expect((await createArticle(json("POST", { titre: "t", texte: "x" }))).status).toBe(401);
    expect((await deleteArticle(json("DELETE", {}), ctx(ARTICLE))).status).toBe(401);
    expect((await like(json("POST", {}), ctx(ARTICLE))).status).toBe(401);
    expect((await createComment(json("POST", { id_article: ARTICLE, texte: "x" }))).status).toBe(401);
    expect((await deleteUser(json("DELETE", {}), ctx(ME))).status).toBe(401);
    expect(prisma.article.create).not.toHaveBeenCalled();
  });
});

describe("cross-origin requests", () => {
  it("are rejected with 403 even with a session", async () => {
    const res = await like(json("POST", {}, { origin: "https://evil.example" }), ctx(ARTICLE));
    expect(res.status).toBe(403);
  });
});

describe("article deletion", () => {
  it("is forbidden (403) to someone who is not the author", async () => {
    prisma.article.findUnique.mockResolvedValue({ auteurId: OTHER });
    const res = await deleteArticle(json("DELETE", {}), ctx(ARTICLE));
    expect(res.status).toBe(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("is allowed to the author", async () => {
    prisma.article.findUnique.mockResolvedValue({ auteurId: ME });
    const res = await deleteArticle(json("DELETE", {}), ctx(ARTICLE));
    expect(res.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it("answers 404 for an unknown article", async () => {
    prisma.article.findUnique.mockResolvedValue(null);
    expect((await deleteArticle(json("DELETE", {}), ctx(ARTICLE))).status).toBe(404);
  });
});

describe("account deletion", () => {
  it("is forbidden (403) for another account", async () => {
    const res = await deleteUser(json("DELETE", {}), ctx(OTHER));
    expect(res.status).toBe(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("is allowed for the owner and removes the sessions", async () => {
    prisma.article.findMany.mockResolvedValue([]);
    const res = await deleteUser(json("DELETE", {}), ctx(ME));
    expect(res.status).toBe(200);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: ME } });
  });
});

describe("identity comes from the session, never from the body", () => {
  it("creates the article for the session user whatever userId is sent", async () => {
    prisma.article.create.mockResolvedValue({ id: ARTICLE });
    const res = await createArticle(json("POST", { titre: "t", texte: "x", userId: OTHER }));
    expect(res.status).toBe(201);
    expect(prisma.article.create.mock.calls[0][0].data.auteur).toEqual({ connect: { id: ME } });
  });

  it("writes the comment as the session user", async () => {
    prisma.article.findUnique.mockResolvedValue({ id: ARTICLE });
    prisma.commentaire.create.mockResolvedValue({ id: "d".repeat(24) });
    const res = await createComment(json("POST", { id_article: ARTICLE, texte: "x", commentataireId: OTHER }));
    expect(res.status).toBe(201);
    expect(prisma.commentaire.create.mock.calls[0][0].data.commentataireId).toBe(ME);
  });

  it("toggles the reaction of the session user", async () => {
    prisma.article.findUnique.mockResolvedValue({ reaction1: [], reaction2: [] });
    prisma.article.update.mockResolvedValue({ id: ARTICLE });
    await like(json("POST", { userId: OTHER }), ctx(ARTICLE));
    expect(prisma.article.update.mock.calls[0][0].data).toEqual({ reaction1: { push: ME } });
  });
});
