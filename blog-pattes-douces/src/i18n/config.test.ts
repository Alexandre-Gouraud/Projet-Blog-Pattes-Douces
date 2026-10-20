import { describe, expect, it } from "vitest";
import { isLocale, negotiateLocale } from "./config";

describe("isLocale", () => {
  it("accepts supported locales", () => {
    for (const l of ["fr", "en", "ar", "zh"]) expect(isLocale(l)).toBe(true);
  });

  it("rejects everything else", () => {
    for (const v of ["de", "FR", "", "fr-FR", null, undefined, 1, {}]) expect(isLocale(v)).toBe(false);
  });
});

describe("negotiateLocale", () => {
  it("defaults to fr without header", () => {
    expect(negotiateLocale(null)).toBe("fr");
    expect(negotiateLocale("")).toBe("fr");
  });

  it("picks the first supported language", () => {
    expect(negotiateLocale("ar-SA,ar;q=0.9,fr;q=0.8")).toBe("ar");
  });

  it("orders by quality", () => {
    expect(negotiateLocale("fr;q=0.5,en;q=0.9")).toBe("en");
    expect(negotiateLocale("de,zh;q=0.4,en;q=0.2")).toBe("zh");
  });

  it("falls back to fr when only unsupported languages", () => {
    expect(negotiateLocale("de-DE,es;q=0.8")).toBe("fr");
  });

  it("ignores q=0", () => {
    expect(negotiateLocale("en;q=0,zh;q=0.1")).toBe("zh");
    expect(negotiateLocale("en;q=0")).toBe("fr");
  });

  it("handles region subtags and case", () => {
    expect(negotiateLocale("en-US")).toBe("en");
    expect(negotiateLocale("ZH-Hans-CN")).toBe("zh");
  });
});
