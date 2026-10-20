import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "./proxy";

function req(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

describe("proxy", () => {
  it("redirects to the browser language", () => {
    const res = proxy(req("/feed", { "accept-language": "en-US,en;q=0.9" }));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/en/feed");
  });

  it("prefers the NEXT_LOCALE cookie over the header", () => {
    const res = proxy(req("/feed", { "accept-language": "en-US,en;q=0.9", cookie: "NEXT_LOCALE=zh" }));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/zh/feed");
  });

  it("ignores an invalid cookie", () => {
    const res = proxy(req("/feed", { "accept-language": "en", cookie: "NEXT_LOCALE=xx" }));
    expect(new URL(res.headers.get("location")!).pathname).toBe("/en/feed");
  });

  it("redirects / to /fr by default", () => {
    const res = proxy(req("/"));
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/fr");
  });

  it("passes through URLs that already have a locale", () => {
    const res = proxy(req("/fr/feed"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects case-only legacy URLs with 308", () => {
    const res = proxy(req("/Feed"));
    expect(res.status).toBe(308);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/feed");
  });

  it("preserves the query string", () => {
    const res = proxy(req("/feed?page=2&q=chat", { "accept-language": "ar" }));
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/ar/feed");
    expect(location.search).toBe("?page=2&q=chat");
  });
});

describe("proxy config.matcher", () => {
  // Next.js anchors matcher patterns with path-to-regexp; emulate with ^...$.
  const regex = new RegExp(`^${config.matcher[0]}$`);

  it("matches pages", () => {
    for (const p of ["/", "/feed", "/fr/feed", "/articles/123"]) expect(regex.test(p)).toBe(true);
  });

  it("excludes /api, /_next and files with an extension", () => {
    for (const p of ["/api/articles", "/_next/static/x.js", "/favicon.ico", "/images/flags/fr.svg"]) {
      expect(regex.test(p)).toBe(false);
    }
  });
});
