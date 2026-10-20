import { describe, expect, it } from "vitest";
import { localizePath, stripLocale } from "./navigation";

describe("localizePath", () => {
  it("prefixes internal paths", () => {
    expect(localizePath("fr", "/")).toBe("/fr");
    expect(localizePath("fr", "/feed")).toBe("/fr/feed");
    expect(localizePath("zh", "/articles/1")).toBe("/zh/articles/1");
  });

  it("leaves external and relative targets unchanged", () => {
    expect(localizePath("fr", "//x")).toBe("//x");
    expect(localizePath("fr", "https://x.com")).toBe("https://x.com");
  });
});

describe("stripLocale", () => {
  it("removes the locale segment", () => {
    expect(stripLocale("/ar/feed")).toBe("/feed");
    expect(stripLocale("/fr")).toBe("/");
  });

  it("leaves other paths unchanged", () => {
    expect(stripLocale("/feed")).toBe("/feed");
    expect(stripLocale("/")).toBe("/");
  });
});
