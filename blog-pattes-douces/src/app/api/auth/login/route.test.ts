import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const { findUnique, createSession } = vi.hoisted(() => ({ findUnique: vi.fn(), createSession: vi.fn() }));
const throttle = vi.hoisted(() => ({ countAttempt: vi.fn(), releaseOnSuccess: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique } } }));
vi.mock("@/lib/auth/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/server")>()),
  createSession,
}));
vi.mock("@/lib/auth/throttle", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/throttle")>()),
  ...throttle,
}));

import { POST } from "./route";

const login = (pseudo: string, password: string, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({ pseudo, password }),
    })
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  throttle.countAttempt.mockResolvedValue(null);
  findUnique.mockResolvedValue({ id: "1", pseudo: "mimi", espece: null, password: bcrypt.hashSync("secret-pass", 4) });
});

describe("POST /api/auth/login throttling", () => {
  it("counts the attempt and answers 429 with Retry-After before touching the account", async () => {
    throttle.countAttempt.mockResolvedValue(600);
    const res = await login("mimi", "secret-pass");
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("600");
    expect(findUnique).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  it("treats an unknown pseudo exactly like a known one", async () => {
    throttle.countAttempt.mockResolvedValue(600);
    findUnique.mockResolvedValue(null);
    const res = await login("inconnu", "x");
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ message: "Trop de tentatives. Réessayez plus tard.", retryAfter: 600 });
  });

  it("counts a wrong password and an unknown pseudo, without resetting", async () => {
    expect((await login("mimi", "mauvais")).status).toBe(401);
    findUnique.mockResolvedValue(null);
    expect((await login("inconnu", "x")).status).toBe(401);
    expect(throttle.countAttempt).toHaveBeenCalledTimes(2);
    expect(throttle.releaseOnSuccess).not.toHaveBeenCalled();
  });

  it("opens the session and releases the counters on success", async () => {
    const res = await login("mimi", "secret-pass");
    expect(res.status).toBe(200);
    expect(createSession).toHaveBeenCalledWith("1");
    expect(throttle.releaseOnSuccess).toHaveBeenCalledTimes(1);
  });

  it("keys on pseudo only without TRUST_PROXY, on IP+pseudo and IP with it", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await login("mimi", "x", { "x-forwarded-for": "203.0.113.9" });
    expect(throttle.countAttempt.mock.calls[0][0]).toHaveLength(1);
    vi.stubEnv("TRUST_PROXY", "true");
    await login("mimi", "x", { "x-forwarded-for": "6.6.6.6, 203.0.113.9" });
    expect(throttle.countAttempt.mock.calls[1][0]).toHaveLength(2);
  });
});
