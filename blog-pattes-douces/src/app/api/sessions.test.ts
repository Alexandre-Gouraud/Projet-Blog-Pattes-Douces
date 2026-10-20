import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const ME = "a".repeat(24);
const ARTICLE = "c".repeat(24);
const DAY = 86_400_000;

const { store, cookieStore, prisma } = vi.hoisted(() => {
  const store = new Map<string, string>();
  return {
    store,
    cookieStore: {
      get: vi.fn((name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined)),
      set: vi.fn((name: string, value: string, _options?: unknown) => void store.set(name, value)),
      delete: vi.fn((name: string) => void store.delete(name)),
    },
    prisma: {
      session: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
      user: { findUnique: vi.fn(), deleteMany: vi.fn() },
      article: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
      commentaire: { deleteMany: vi.fn() },
      $transaction: vi.fn(),
    },
  };
});

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("@vercel/blob", () => ({ put: vi.fn() }));
// Seul l'acces a la base est simule : requireUser, getSessionUser... gardent leur vraie logique.
vi.mock("@/lib/prisma", async () => {
  const actual = await vi.importActual<typeof import("@/lib/prisma")>("@/lib/prisma").catch(() => null);
  return { prisma, publicUserSelect: actual?.publicUserSelect ?? { id: true, pseudo: true, espece: true } };
});

import { SESSION_COOKIE, hashToken } from "@/lib/auth/token";
import { POST as login } from "./auth/login/route";
import { POST as logout } from "./auth/logout/route";
import { GET as me } from "./auth/me/route";
import { POST as dislike } from "./articles/[id]/dislike/route";
import { POST as addView } from "./articles/[id]/views/route";
import { POST as upload } from "./uploads/route";
import { DELETE as deleteUser, GET as getUser } from "./users/[id]/route";
import { POST as like } from "./articles/[id]/like/route";

const user = { id: ME, pseudo: "Pistache", espece: "cat" };
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (headers: Record<string, string> = {}, body: unknown = {}) =>
  new NextRequest("http://localhost:3000/api/x", {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
    body: JSON.stringify(body),
  });

function validSession(overrides: Record<string, unknown> = {}) {
  prisma.session.findUnique.mockResolvedValue({
    id: "s1",
    expiresAt: new Date(Date.now() + 10 * DAY),
    lastSeenAt: new Date(),
    user,
    ...overrides,
  });
}

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe("a route guarded by the real requireUser (views)", () => {
  beforeEach(() => {
    prisma.article.findUnique.mockResolvedValue({ vue: [] });
    prisma.article.update.mockResolvedValue({});
  });

  it("answers 401 without cookie", async () => {
    const res = await addView(post(), ctx(ARTICLE));
    expect(res.status).toBe(401);
    expect(prisma.session.findUnique).not.toHaveBeenCalled();
  });

  it("answers 401 for an unknown token", async () => {
    store.set(SESSION_COOKIE, "nope");
    prisma.session.findUnique.mockResolvedValue(null);
    expect((await addView(post(), ctx(ARTICLE))).status).toBe(401);
  });

  it("answers 401 for an expired session and deletes it", async () => {
    store.set(SESSION_COOKIE, "t");
    validSession({ expiresAt: new Date(Date.now() - 1000) });
    expect((await addView(post(), ctx(ARTICLE))).status).toBe(401);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { id: "s1" } });
  });

  it("answers 200 for a valid session and records the view for that user", async () => {
    store.set(SESSION_COOKIE, "t");
    validSession();
    const res = await addView(post(), ctx(ARTICLE));
    expect(res.status).toBe(200);
    expect(prisma.session.findUnique.mock.calls[0][0].where).toEqual({ tokenHash: hashToken("t") });
    expect(prisma.article.update.mock.calls[0][0].data).toEqual({ vue: { push: ME } });
  });

  it("answers a JSON 500 when the database fails", async () => {
    store.set(SESSION_COOKIE, "t");
    prisma.session.findUnique.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await addView(post(), ctx(ARTICLE));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: expect.any(String) });
  });
});

describe("cross-origin mutations", () => {
  const evil = { origin: "https://evil.example" };

  it.each([
    ["views", () => addView(post(evil), ctx(ARTICLE))],
    ["like", () => like(post(evil), ctx(ARTICLE))],
    ["dislike", () => dislike(post(evil), ctx(ARTICLE))],
    ["uploads", () => upload(post(evil))],
  ])("%s answers 403 even with a valid session", async (_name, call) => {
    store.set(SESSION_COOKIE, "t");
    validSession();
    const res = await call();
    expect(res.status).toBe(403);
    expect(prisma.session.findUnique).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  const password = "Patte123!";
  let hash: string;

  beforeEach(async () => {
    hash ??= await bcrypt.hash(password, 4);
    prisma.user.findUnique.mockResolvedValue({ ...user, password: hash });
  });

  it("sets the httpOnly cookie, stores only the hash and never returns the password", async () => {
    const res = await login(post({}, { pseudo: "Pistache", password }));
    expect(res.status).toBe(200);
    const token = store.get(SESSION_COOKIE)!;
    expect(token).toBeTruthy();
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(prisma.session.create.mock.calls[0][0].data.tokenHash).toBe(hashToken(token));
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("password");
    expect(text).not.toContain(hash);
  });

  it("destroys the previous session of the browser (no fixation)", async () => {
    store.set(SESSION_COOKIE, "old-token");
    await login(post({}, { pseudo: "Pistache", password }));
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { tokenHash: hashToken("old-token") } });
    expect(store.get(SESSION_COOKIE)).not.toBe("old-token");
  });

  it("answers 401 without opening a session for a wrong password", async () => {
    const res = await login(post({}, { pseudo: "Pistache", password: "wrong" }));
    expect(res.status).toBe(401);
    expect(store.has(SESSION_COOKIE)).toBe(false);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/logout", () => {
  it("deletes the session row and removes the cookie", async () => {
    store.set(SESSION_COOKIE, "t");
    const res = await logout(post());
    expect(res.status).toBe(200);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { tokenHash: hashToken("t") } });
    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
    expect(store.has(SESSION_COOKIE)).toBe(false);
  });

  it("rejects a cross-origin request", async () => {
    expect((await logout(post({ origin: "https://evil.example" }))).status).toBe(403);
  });
});

describe("GET /api/auth/me", () => {
  it("answers 200 with the user and no-store", async () => {
    store.set(SESSION_COOKIE, "t");
    validSession();
    const res = await me();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ user });
  });

  it("answers 401 with no-store without session", async () => {
    const res = await me();
    expect(res.status).toBe(401);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("answers a JSON 500 with no-store when the database fails", async () => {
    store.set(SESSION_COOKIE, "t");
    prisma.session.findUnique.mockRejectedValue(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await me();
    expect(res.status).toBe(500);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("DELETE /api/users/[id]", () => {
  it("deletes the account and clears the session cookie", async () => {
    store.set(SESSION_COOKIE, "t");
    validSession();
    prisma.article.findMany.mockResolvedValue([]);
    prisma.$transaction.mockResolvedValue([{ count: 0 }, { count: 0 }, { count: 1 }, { count: 1 }]);
    const res = await deleteUser(
      new NextRequest("http://localhost:3000/api/users/x", { method: "DELETE", headers: { host: "localhost:3000" } }),
      ctx(ME) as never
    );
    expect(res.status).toBe(200);
    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
    expect(store.has(SESSION_COOKIE)).toBe(false);
  });

  it("keeps the cookie when the deletion is refused", async () => {
    store.set(SESSION_COOKIE, "t");
    validSession();
    const res = await deleteUser(
      new NextRequest("http://localhost:3000/api/users/x", { method: "DELETE", headers: { host: "localhost:3000" } }),
      ctx("b".repeat(24)) as never
    );
    expect(res.status).toBe(403);
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });
});

describe("GET /api/users/[id]", () => {
  it("never returns the email or the password", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: ME, pseudo: "Pistache", espece: "cat", biographie: "Miaou" });
    const res = await getUser(new Request("http://localhost:3000/api/users/x"), ctx(ME) as never);
    expect(res.status).toBe(200);
    const select = prisma.user.findUnique.mock.calls[0][0].select;
    expect(select).not.toHaveProperty("email");
    expect(select).not.toHaveProperty("password");
    const body = await res.json();
    expect(body).not.toHaveProperty("email");
    expect(body).not.toHaveProperty("password");
  });
});
