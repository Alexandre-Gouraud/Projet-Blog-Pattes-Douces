import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMe } = vi.hoisted(() => ({ fetchMe: vi.fn() }));
vi.mock("@/lib/api-client", () => ({ fetchMe }));

import {
  clearSession,
  getSessionSnapshot as snapshot,
  justSignedOutOnPurpose,
  refreshSession,
  resetSessionForTests,
  setSessionUser,
} from "./session";

const me = { id: "a".repeat(24), pseudo: "Pistache", espece: "cat" };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  resetSessionForTests();
  fetchMe.mockReset();
});

describe("refreshSession", () => {
  it("treats a 401 (null user) as a visitor", async () => {
    fetchMe.mockResolvedValue(null);
    await refreshSession();
    expect(snapshot()).toEqual({ ready: true, user: null, unknown: false });
  });

  it("stores the user returned by the server", async () => {
    fetchMe.mockResolvedValue(me);
    await refreshSession();
    expect(snapshot()).toEqual({ ready: true, user: me, unknown: false });
  });

  it("does NOT turn a network/5xx/timeout failure into a visitor", async () => {
    fetchMe.mockRejectedValue(new Error("timeout"));
    await refreshSession();
    expect(snapshot()).toEqual({ ready: true, user: null, unknown: true });
  });

  it("keeps the known user when a later refresh fails", async () => {
    fetchMe.mockResolvedValueOnce(me);
    await refreshSession();
    fetchMe.mockRejectedValueOnce(new Error("500"));
    await refreshSession();
    expect(snapshot()).toEqual({ ready: true, user: me, unknown: false });
  });

  it("recovers from the unknown state on the next successful refresh", async () => {
    fetchMe.mockRejectedValueOnce(new Error("down"));
    await refreshSession();
    fetchMe.mockResolvedValueOnce(me);
    await refreshSession();
    expect(snapshot()).toEqual({ ready: true, user: me, unknown: false });
  });
});

describe("stale responses", () => {
  it("ignores a /me response sent before a login", async () => {
    const slow = deferred<typeof me | null>();
    fetchMe.mockReturnValueOnce(slow.promise);
    const pending = refreshSession();
    setSessionUser(me);
    slow.resolve(null);
    await pending;
    expect(snapshot().user).toEqual(me);
  });

  it("ignores a /me response sent before a logout", async () => {
    setSessionUser(me);
    const slow = deferred<typeof me | null>();
    fetchMe.mockReturnValueOnce(slow.promise);
    const pending = refreshSession();
    clearSession();
    slow.resolve(me);
    await pending;
    expect(snapshot().user).toBeNull();
  });

  it("does not discard the fresher of two concurrent refreshes", async () => {
    const first = deferred<typeof me | null>();
    const second = deferred<typeof me | null>();
    fetchMe.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const a = refreshSession();
    const b = refreshSession();
    first.resolve(null);
    await a;
    second.resolve(me);
    await b;
    expect(snapshot().user).toEqual(me);
  });
});

describe("voluntary sign-out", () => {
  it("is flagged only when asked, and only briefly", () => {
    expect(justSignedOutOnPurpose()).toBe(false);
    clearSession();
    expect(justSignedOutOnPurpose()).toBe(false);
    clearSession({ onPurpose: true });
    expect(justSignedOutOnPurpose()).toBe(true);
    expect(justSignedOutOnPurpose(Date.now() + 60_000)).toBe(false);
  });
});
