import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = { key: string; count: number; windowStart: Date; lockedUntil: Date | null };
type Where = {
  key?: string | { in: string[] };
  windowStart?: Date | { lt: Date };
  lockedUntil?: null | { lt: Date };
  count?: { gt: number };
  OR?: { lockedUntil: null | { lt: Date } }[];
};
type Data = Partial<{ count: number | { increment: number } | { decrement: number }; windowStart: Date; lockedUntil: Date | null }>;
const store = new Map<string, Row>();

function apply(row: Row, data: Data) {
  if (typeof data.count === "number") row.count = data.count;
  else if (data.count && "increment" in data.count) row.count += data.count.increment;
  else if (data.count && "decrement" in data.count) row.count -= data.count.decrement;
  if (data.windowStart) row.windowStart = data.windowStart;
  if (data.lockedUntil !== undefined) row.lockedUntil = data.lockedUntil;
}

function matches(row: Row, where: Where): boolean {
  const lockMatch = (c: null | { lt: Date }) => (c === null ? row.lockedUntil === null : row.lockedUntil !== null && row.lockedUntil < c.lt);
  if (typeof where.key === "string" && row.key !== where.key) return false;
  if (where.key && typeof where.key === "object" && !where.key.in.includes(row.key)) return false;
  if (where.windowStart instanceof Date && row.windowStart.getTime() !== where.windowStart.getTime()) return false;
  if (where.windowStart && !(where.windowStart instanceof Date) && !(row.windowStart < where.windowStart.lt)) return false;
  if (where.lockedUntil !== undefined && !lockMatch(where.lockedUntil)) return false;
  if (where.count && !(row.count > where.count.gt)) return false;
  if (where.OR && !where.OR.some((c) => lockMatch(c.lockedUntil))) return false;
  return true;
}

// Faux client Prisma en memoire : seules les operations utilisees par throttle.ts.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    loginThrottle: {
      upsert: async ({ where, create, update }: { where: { key: string }; create: Row; update: Data }) => {
        const row = store.get(where.key);
        if (row) apply(row, update);
        else store.set(where.key, { ...create });
        return { ...store.get(where.key)! };
      },
      update: async ({ where, data }: { where: { key: string }; data: Data }) => {
        const row = store.get(where.key);
        if (!row) throw new Error("not found");
        apply(row, data);
        return { ...row };
      },
      updateMany: async ({ where, data }: { where: Where; data: Data }) => {
        const rows = [...store.values()].filter((r) => matches(r, where));
        rows.forEach((r) => apply(r, data));
        return { count: rows.length };
      },
      deleteMany: async ({ where }: { where: Where }) => {
        const rows = [...store.values()].filter((r) => matches(r, where));
        rows.forEach((r) => store.delete(r.key));
        return { count: rows.length };
      },
    },
  },
}));

import {
  THROTTLE,
  countAttempt,
  loginRules,
  normalizePseudo,
  purgeExpired,
  registerRules,
  releaseOnSuccess,
  tooManyAttempts,
} from "./throttle";

const T0 = new Date("2026-01-01T12:00:00Z");
const at = (ms: number) => new Date(T0.getTime() + ms);
const never = () => 1; // pas de purge opportuniste

beforeEach(() => store.clear());
afterEach(() => vi.unstubAllEnvs());

async function attempts(rules: ReturnType<typeof loginRules>, n: number, start = 0) {
  const results: (number | null)[] = [];
  for (let i = 0; i < n; i++) results.push(await countAttempt(rules, at(start + i), never));
  return results;
}

describe("keys", () => {
  it("normalizes the pseudo (case, Unicode form) and hides it", () => {
    expect(normalizePseudo("  ＭｉＭｉ ")).toBe("mimi");
    const a = loginRules("1.1.1.1", "Mimi");
    expect(a).toEqual(loginRules("1.1.1.1", "mimi"));
    expect(a[0].key).not.toContain("mimi");
    expect(loginRules("2.2.2.2", "mimi")[0].key).not.toBe(a[0].key);
    expect(a[1].key).toBe(loginRules("1.1.1.1", "autre")[1].key);
  });

  it("uses an HMAC when THROTTLE_SECRET is set", () => {
    const plain = loginRules("1.1.1.1", "mimi")[0].key;
    vi.stubEnv("THROTTLE_SECRET", "s3cret");
    const keyed = loginRules("1.1.1.1", "mimi")[0].key;
    expect(keyed).not.toBe(plain);
    expect(keyed).toBe(loginRules("1.1.1.1", "mimi")[0].key);
  });
});

describe("with a trusted IP", () => {
  it("allows 5 attempts per IP+pseudo, then locks for 15 minutes", async () => {
    const rules = loginRules("1.1.1.1", "mimi");
    const results = await attempts(rules, 6);
    expect(results.slice(0, 5)).toEqual([null, null, null, null, null]);
    expect(results[5]).toBe(15 * 60);
    // Retry-After decroit avec le temps.
    const later = await countAttempt(rules, at(60_000), never);
    expect(later).toBeGreaterThanOrEqual(14 * 60);
    expect(later).toBeLessThanOrEqual(14 * 60 + 1);
  });

  it("unlocks after the lock and starts again from a count of 1", async () => {
    const rules = loginRules("1.1.1.1", "mimi");
    await attempts(rules, 6);
    const later = at(5 + THROTTLE.lockMs + 1);
    expect(await countAttempt(rules, later, never)).toBeNull();
    expect(store.get(rules[0].key)?.count).toBe(1);
  });

  it("starts a new window after 15 minutes (count back to 1)", async () => {
    const rules = loginRules("1.1.1.1", "mimi");
    await attempts(rules, 4);
    expect(store.get(rules[0].key)?.count).toBe(4);
    expect(await countAttempt(rules, at(THROTTLE.windowMs + 1000), never)).toBeNull();
    expect(store.get(rules[0].key)?.count).toBe(1);
    expect(store.get(rules[0].key)?.windowStart).toEqual(at(THROTTLE.windowMs + 1000));
  });

  it("locks a pseudo only for the offending IP", async () => {
    await attempts(loginRules("1.1.1.1", "mimi"), 6);
    expect(await countAttempt(loginRules("2.2.2.2", "mimi"), at(10), never)).toBeNull();
  });

  it("locks the whole IP after 20 attempts across pseudos", async () => {
    for (let i = 0; i < THROTTLE.perIp; i++) await countAttempt(loginRules("1.1.1.1", `user${i}`), at(i), never);
    expect(await countAttempt(loginRules("1.1.1.1", "nouveau"), at(100), never)).not.toBeNull();
    expect(await countAttempt(loginRules("3.3.3.3", "nouveau"), at(100), never)).toBeNull();
  });

  it("cannot be raced: concurrent attempts are counted atomically", async () => {
    const rules = loginRules("1.1.1.1", "mimi");
    const results = await Promise.all(Array.from({ length: 8 }, () => countAttempt(rules, at(0), never)));
    expect(results.filter((r) => r === null)).toHaveLength(THROTTLE.perPair);
    expect(results.filter((r) => r !== null)).toHaveLength(3);
  });

  it("resets the pair counter and refunds one IP attempt on success", async () => {
    const rules = loginRules("1.1.1.1", "mimi");
    await attempts(rules, 3);
    await releaseOnSuccess(rules);
    expect(store.has(rules[0].key)).toBe(false);
    expect(store.get(rules[1].key)?.count).toBe(2);
    expect(await countAttempt(rules, at(10), never)).toBeNull();
    expect(store.get(rules[0].key)?.count).toBe(1);
  });
});

describe("without a trusted IP", () => {
  it("uses a single per-pseudo key, 10 attempts, whatever the pseudo case", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const rules = loginRules(null, "Mimi");
    expect(rules).toHaveLength(1);
    expect(rules[0].key).toBe(loginRules(null, "mimi")[0].key);
    const results = await attempts(rules, 11);
    expect(results.slice(0, 10).every((r) => r === null)).toBe(true);
    expect(results[10]).toBe(15 * 60);
    // un autre pseudo n'est pas touche
    expect(await countAttempt(loginRules(null, "autre"), at(20), never)).toBeNull();
  });

  it("does not limit sign-ups and warns only once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    warn.mockClear();
    expect(registerRules(null)).toEqual([]);
    loginRules(null, "x");
    expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
  });
});

describe("register", () => {
  it("allows 20 attempts per IP then locks", async () => {
    const rules = registerRules("1.1.1.1");
    const results = await attempts(rules, THROTTLE.perIp + 1);
    expect(results.at(-1)).toBe(15 * 60);
    expect(results.slice(0, -1).every((r) => r === null)).toBe(true);
  });
});

describe("cleanup", () => {
  it("purges only rows whose window and lock are expired", async () => {
    const old = loginRules("1.1.1.1", "vieux");
    const locked = loginRules("1.1.1.1", "bloque");
    await attempts(old, 1);
    await attempts(locked, 6, 0);
    await purgeExpired(at(THROTTLE.windowMs + 1)); // fenetre expiree, verrou encore actif pour `locked`
    expect(store.has(old[0].key)).toBe(false);
    expect(store.has(locked[0].key)).toBe(true);
    await purgeExpired(at(THROTTLE.windowMs + THROTTLE.lockMs + 10_000));
    expect(store.has(locked[0].key)).toBe(false);
  });

  it("runs on roughly one attempt in fifty", async () => {
    const rules = loginRules("1.1.1.1", "mimi");
    await countAttempt(rules, at(0), never);
    await countAttempt(rules, at(THROTTLE.windowMs * 3), () => 0.5); // pas de purge
    expect(store.size).toBe(2);
    store.set("old", { key: "old", count: 1, windowStart: at(0), lockedUntil: null });
    await countAttempt(rules, at(THROTTLE.windowMs * 3 + 1), () => 0); // purge
    expect(store.has("old")).toBe(false);
  });
});

describe("tooManyAttempts", () => {
  it("answers 429 with Retry-After and no account information", async () => {
    const res = tooManyAttempts(123);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("123");
    expect(await res.json()).toEqual({ message: "Trop de tentatives. Réessayez plus tard.", retryAfter: 123 });
  });
});
