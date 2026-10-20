import { beforeEach, describe, expect, it, vi } from "vitest";

const { store, cookieStore, session } = vi.hoisted(() => {
  const store = new Map<string, string>();
  return {
    store,
    cookieStore: {
      get: vi.fn((name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined)),
      set: vi.fn((name: string, value: string, _options?: unknown) => void store.set(name, value)),
      delete: vi.fn((name: string) => void store.delete(name)),
    },
    session: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
  };
});
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));
vi.mock("@/lib/prisma", () => ({ prisma: { session } }));

import { createSession, destroySession, getSessionUser, requireUser } from "./server";
import { SESSION_COOKIE, hashToken } from "./token";

const user = { id: "a".repeat(24), pseudo: "Pistache", espece: "cat" };
const DAY = 86_400_000;

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe("createSession", () => {
  it("stores only the hash and sets an httpOnly cookie", async () => {
    await createSession(user.id);
    const token = store.get(SESSION_COOKIE)!;
    expect(token).toBeTruthy();
    const data = session.create.mock.calls[0][0].data;
    expect(data.tokenHash).toBe(hashToken(token));
    expect(data.tokenHash).not.toBe(token);
    expect(data.userId).toBe(user.id);
    expect(cookieStore.set.mock.calls[0][2]).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
  });

  it("replaces the previous session of the browser", async () => {
    store.set(SESSION_COOKIE, "old-token");
    await createSession(user.id);
    expect(session.deleteMany).toHaveBeenCalledWith({ where: { tokenHash: hashToken("old-token") } });
    expect(store.get(SESSION_COOKIE)).not.toBe("old-token");
  });
});

describe("getSessionUser", () => {
  it("returns null without cookie, without touching the database", async () => {
    expect(await getSessionUser()).toBeNull();
    expect(session.findUnique).not.toHaveBeenCalled();
  });

  it("returns null for an unknown token", async () => {
    store.set(SESSION_COOKIE, "t");
    session.findUnique.mockResolvedValue(null);
    expect(await getSessionUser()).toBeNull();
    expect(session.findUnique.mock.calls[0][0].where).toEqual({ tokenHash: hashToken("t") });
  });

  it("rejects and deletes an expired session", async () => {
    store.set(SESSION_COOKIE, "t");
    session.findUnique.mockResolvedValue({
      id: "s1",
      expiresAt: new Date(Date.now() - 1000),
      lastSeenAt: new Date(),
      user,
    });
    expect(await getSessionUser()).toBeNull();
    expect(session.deleteMany).toHaveBeenCalledWith({ where: { id: "s1" } });
  });

  it("returns the user of a valid session without renewing a fresh one", async () => {
    store.set(SESSION_COOKIE, "t");
    session.findUnique.mockResolvedValue({
      id: "s1",
      expiresAt: new Date(Date.now() + 10 * DAY),
      lastSeenAt: new Date(),
      user,
    });
    expect(await getSessionUser()).toEqual(user);
    expect(session.update).not.toHaveBeenCalled();
  });

  it("renews a session last seen more than a day ago", async () => {
    store.set(SESSION_COOKIE, "t");
    session.findUnique.mockResolvedValue({
      id: "s1",
      expiresAt: new Date(Date.now() + 10 * DAY),
      lastSeenAt: new Date(Date.now() - 2 * DAY),
      user,
    });
    expect(await getSessionUser()).toEqual(user);
    expect(session.update).toHaveBeenCalledOnce();
    expect(cookieStore.set).toHaveBeenCalledOnce();
  });
});

describe("destroySession", () => {
  it("deletes the session row and the cookie", async () => {
    store.set(SESSION_COOKIE, "t");
    await destroySession();
    expect(session.deleteMany).toHaveBeenCalledWith({ where: { tokenHash: hashToken("t") } });
    expect(store.has(SESSION_COOKIE)).toBe(false);
  });
});

describe("requireUser", () => {
  const post = (headers: Record<string, string> = {}) =>
    new Request("http://localhost:3000/api/x", { method: "POST", headers: { host: "localhost:3000", ...headers } });

  it("answers 401 without session", async () => {
    const auth = await requireUser(post());
    expect(auth.response?.status).toBe(401);
  });

  it("answers 403 for a cross-origin mutation, before looking at the session", async () => {
    const auth = await requireUser(post({ origin: "https://evil.example" }));
    expect(auth.response?.status).toBe(403);
    expect(session.findUnique).not.toHaveBeenCalled();
  });

  it("returns the session user", async () => {
    store.set(SESSION_COOKIE, "t");
    session.findUnique.mockResolvedValue({
      id: "s1",
      expiresAt: new Date(Date.now() + DAY),
      lastSeenAt: new Date(),
      user,
    });
    const auth = await requireUser(post({ origin: "http://localhost:3000" }));
    expect(auth.user).toEqual(user);
  });
});
