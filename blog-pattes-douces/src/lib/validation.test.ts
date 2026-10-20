import { describe, expect, it } from "vitest";
import {
  isBlobImageUrl,
  isEmail,
  isObjectId,
  isSpecies,
  isText,
  passwordError,
  passwordIssue,
} from "./validation";

describe("passwordIssue", () => {
  it("flags each rule", () => {
    expect(passwordIssue("Ab1!")).toBe("length");
    expect(passwordIssue(`Ab1!${"a".repeat(125)}`)).toBe("long");
    expect(passwordIssue("abcdefg1!")).toBe("upper");
    expect(passwordIssue("ABCDEFG1!")).toBe("lower");
    expect(passwordIssue("Abcdefgh!")).toBe("digit");
    expect(passwordIssue("Abcdefg12")).toBe("special");
  });

  it("accepts a valid password, including the length bounds", () => {
    expect(passwordIssue("Abcdef1!")).toBeNull();
    expect(passwordIssue(`Ab1!${"a".repeat(124)}`)).toBeNull();
  });
});

describe("passwordError", () => {
  it("returns a message for an invalid password", () => {
    expect(passwordError("short")).toMatch(/au moins 8 caractères/);
    expect(passwordError("abcdefg1!")).toMatch(/majuscule/);
  });

  it("returns null for a valid password", () => {
    expect(passwordError("Abcdef1!")).toBeNull();
  });
});

describe("isEmail", () => {
  it("accepts and rejects", () => {
    expect(isEmail("a@b.co")).toBe(true);
    for (const v of ["", "a@b", "a b@c.fr", "@b.fr", 12, null]) expect(isEmail(v)).toBe(false);
    expect(isEmail(`${"a".repeat(250)}@b.fr`)).toBe(false);
  });
});

describe("isObjectId", () => {
  it("needs 24 hex characters", () => {
    expect(isObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(isObjectId("507F1F77BCF86CD799439011")).toBe(true);
    for (const v of ["507f1f77bcf86cd79943901", "zzzf1f77bcf86cd799439011", "", null, 5]) {
      expect(isObjectId(v)).toBe(false);
    }
  });
});

describe("isText", () => {
  it("requires a non-blank string within max", () => {
    expect(isText("abc", 3)).toBe(true);
    expect(isText("abcd", 3)).toBe(false);
    expect(isText("   ", 10)).toBe(false);
    expect(isText("", 10)).toBe(false);
    expect(isText(42, 10)).toBe(false);
  });
});

describe("isBlobImageUrl", () => {
  it("accepts https Vercel Blob URLs only", () => {
    expect(isBlobImageUrl("https://abc.public.blob.vercel-storage.com/x.png")).toBe(true);
    expect(isBlobImageUrl("http://abc.public.blob.vercel-storage.com/x.png")).toBe(false);
    expect(isBlobImageUrl("https://evil.com/x.png")).toBe(false);
    expect(isBlobImageUrl("https://public.blob.vercel-storage.com.evil.com/x.png")).toBe(false);
    expect(isBlobImageUrl("not a url")).toBe(false);
    expect(isBlobImageUrl(null)).toBe(false);
  });
});

describe("isSpecies", () => {
  it("accepts listed species", () => {
    for (const s of ["cat", "dog", "rabbit", "kitten", "puppy", "pet"]) expect(isSpecies(s)).toBe(true);
    expect(isSpecies("hamster")).toBe(false);
    expect(isSpecies(undefined)).toBe(false);
  });
});
