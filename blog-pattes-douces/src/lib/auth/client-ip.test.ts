import { describe, expect, it } from "vitest";
import { getClientIp, normalizeIp } from "./client-ip";

const h = (headers: Record<string, string>) => new Headers(headers);

describe("getClientIp", () => {
  it("returns null unless the proxy is trusted", () => {
    expect(getClientIp(h({ "x-forwarded-for": "1.2.3.4" }), false)).toBeNull();
  });

  it("takes the rightmost X-Forwarded-For entry (added by the trusted proxy)", () => {
    expect(getClientIp(h({ "x-forwarded-for": "6.6.6.6, 1.2.3.4" }), true)).toBe("1.2.3.4");
    expect(getClientIp(h({ "x-forwarded-for": "7.7.7.7, 6.6.6.6 , 1.2.3.4" }), true)).toBe("1.2.3.4");
    expect(getClientIp(h({ "x-forwarded-for": " 9.9.9.9 " }), true)).toBe("9.9.9.9");
  });

  it("rejects an invalid rightmost value instead of trusting the spoofable left side", () => {
    expect(getClientIp(h({ "x-forwarded-for": "1.2.3.4, not-an-ip" }), true)).toBeNull();
    expect(getClientIp(h({ "x-forwarded-for": "1.2.3.4," }), true)).toBeNull();
    expect(getClientIp(h({ "x-forwarded-for": "999.1.1.1" }), true)).toBeNull();
  });

  it("falls back to X-Real-IP only when X-Forwarded-For is absent", () => {
    expect(getClientIp(h({ "x-real-ip": "5.6.7.8" }), true)).toBe("5.6.7.8");
    expect(getClientIp(h({ "x-real-ip": "nope" }), true)).toBeNull();
    expect(getClientIp(h({}), true)).toBeNull();
  });

  it("reduces IPv6 to its /64 prefix", () => {
    expect(getClientIp(h({ "x-forwarded-for": "2001:db8:1:2:aaaa:bbbb:cccc:dddd" }), true)).toBe("2001:db8:1:2::/64");
  });
});

describe("normalizeIp", () => {
  it("gives every address of a /64 the same value", () => {
    const a = normalizeIp("2001:db8:0:1:1::1");
    expect(a).toBe("2001:db8:0:1::/64");
    expect(normalizeIp("2001:0DB8:0:1:ffff:ffff:ffff:ffff")).toBe(a);
    expect(normalizeIp("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(normalizeIp("::1")).toBe("0:0:0:0::/64");
  });

  it("keeps IPv4, unwraps IPv4-mapped IPv6 and drops zone ids", () => {
    expect(normalizeIp("203.0.113.9")).toBe("203.0.113.9");
    expect(normalizeIp("::ffff:203.0.113.9")).toBe("203.0.113.9");
    expect(normalizeIp("fe80::1%eth0")).toBe("fe80:0:0:0::/64");
  });

  it("rejects anything that is not an IP", () => {
    expect(normalizeIp("")).toBeNull();
    expect(normalizeIp("1.2.3")).toBeNull();
    expect(normalizeIp("evil, 1.2.3.4")).toBeNull();
  });
});
