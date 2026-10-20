import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirst, create } = vi.hoisted(() => ({ findFirst: vi.fn(), create: vi.fn() }));
const throttle = vi.hoisted(() => ({ countAttempt: vi.fn() }));

vi.mock("@/lib/prisma", () => ({ prisma: { user: { findFirst, create } } }));
vi.mock("@/lib/auth/throttle", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/throttle")>()),
  ...throttle,
}));

import { POST } from "./route";

const body = { pseudo: "Mimi", mail: "mimi@example.fr", password: "Abcdef1!x" };
const register = (headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    })
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  throttle.countAttempt.mockResolvedValue(null);
  findFirst.mockResolvedValue(null);
  create.mockResolvedValue({});
});

describe("POST /api/auth/register throttling", () => {
  it("counts a successful sign-up", async () => {
    vi.stubEnv("TRUST_PROXY", "true");
    expect((await register({ "x-forwarded-for": "203.0.113.9" })).status).toBe(201);
    expect(throttle.countAttempt).toHaveBeenCalledTimes(1);
    expect(throttle.countAttempt.mock.calls[0][0]).toHaveLength(1);
  });

  it("counts a 409 conflict too", async () => {
    findFirst.mockResolvedValue({ pseudo: "Mimi", email: "autre@example.fr" });
    expect((await register()).status).toBe(409);
    expect(throttle.countAttempt).toHaveBeenCalledTimes(1);
  });

  it("answers 429 with Retry-After and creates nothing", async () => {
    throttle.countAttempt.mockResolvedValue(300);
    const res = await register();
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("300");
    expect(findFirst).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("applies no rule without a trusted IP", async () => {
    await register({ "x-forwarded-for": "203.0.113.9" });
    expect(throttle.countAttempt.mock.calls[0][0]).toEqual([]);
  });
});
