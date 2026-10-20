import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  SESSION_RENEW_AFTER_MS,
  cookieOptions,
  generateToken,
  hashToken,
  isExpired,
  sessionExpiry,
  shouldRenew,
} from "./token";

describe("token", () => {
  it("generates 32 random bytes encoded in base64url", () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateToken()).not.toBe(token);
  });

  it("hashes with SHA-256 in hex, deterministically", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});

describe("expiry", () => {
  const now = new Date("2026-01-01T00:00:00Z");

  it("expires 30 days after creation", () => {
    expect(sessionExpiry(now).getTime() - now.getTime()).toBe(SESSION_MAX_AGE_SECONDS * 1000);
    expect(SESSION_MAX_AGE_SECONDS).toBe(30 * 86400);
  });

  it("rejects a session whose expiry is reached", () => {
    expect(isExpired(new Date(now.getTime() - 1), now)).toBe(true);
    expect(isExpired(now, now)).toBe(true);
    expect(isExpired(new Date(now.getTime() + 1), now)).toBe(false);
  });

  it("renews at most once a day", () => {
    expect(shouldRenew(new Date(now.getTime() - SESSION_RENEW_AFTER_MS + 1), now)).toBe(false);
    expect(shouldRenew(new Date(now.getTime() - SESSION_RENEW_AFTER_MS), now)).toBe(true);
  });
});

describe("cookieOptions", () => {
  it("is httpOnly, SameSite=Lax, site-wide and 30 days long", () => {
    const options = cookieOptions("development");
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE_SECONDS });
  });

  it("is Secure in production only", () => {
    expect(cookieOptions("production").secure).toBe(true);
    expect(cookieOptions("development").secure).toBe(false);
    expect(cookieOptions("test").secure).toBe(false);
  });
});
