import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchMe } from "./api-client";

const me = { id: "a".repeat(24), pseudo: "Pistache", espece: "cat" };
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

afterEach(() => vi.unstubAllGlobals());

describe("fetchMe", () => {
  it("returns the user on 200", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(200, { user: me })));
    expect(await fetchMe()).toEqual(me);
  });

  it("returns null on 401 (visitor)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(401, { error: "Connexion requise" })));
    expect(await fetchMe()).toBeNull();
  });

  it("throws on a 5xx instead of answering visitor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(500, { error: "boom" })));
    await expect(fetchMe()).rejects.toMatchObject({ status: 500 });
  });

  it("throws an ApiError(0) when the network or the timeout aborts the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError")));
    await expect(fetchMe()).rejects.toBeInstanceOf(ApiError);
    await expect(fetchMe()).rejects.toMatchObject({ status: 0 });
  });

  it("sends an abort signal (timeout) and bypasses the cache", async () => {
    const spy = vi.fn().mockResolvedValue(reply(200, { user: me }));
    vi.stubGlobal("fetch", spy);
    await fetchMe();
    const init = spy.mock.calls[0][1];
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.cache).toBe("no-store");
  });
});
