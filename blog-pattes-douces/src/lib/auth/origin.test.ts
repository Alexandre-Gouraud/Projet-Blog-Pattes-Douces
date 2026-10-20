import { describe, expect, it } from "vitest";
import { isCrossOriginMutation, isSameOrigin } from "./origin";

const headers = (init: Record<string, string>) => new Headers(init);
const request = (method: string, init: Record<string, string>) =>
  new Request("http://localhost:3000/api/x", { method, headers: init });

describe("isSameOrigin", () => {
  it("accepts an Origin matching the Host", () => {
    expect(isSameOrigin(headers({ origin: "http://localhost:3000", host: "localhost:3000" }))).toBe(true);
  });

  it("rejects another host, another port, a null or malformed Origin", () => {
    expect(isSameOrigin(headers({ origin: "https://evil.example", host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(headers({ origin: "http://localhost:4000", host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(headers({ origin: "null", host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(headers({ origin: "http://localhost:3000" }))).toBe(false);
  });

  it("prefers X-Forwarded-Host behind a proxy", () => {
    expect(
      isSameOrigin(headers({ origin: "https://blog.example", host: "internal:3000", "x-forwarded-host": "blog.example" }))
    ).toBe(true);
  });

  it("falls back on Sec-Fetch-Site without Origin", () => {
    expect(isSameOrigin(headers({ "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isSameOrigin(headers({ "sec-fetch-site": "same-site" }))).toBe(false);
    expect(isSameOrigin(headers({ "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOrigin(headers({}))).toBe(true);
  });
});

describe("isCrossOriginMutation", () => {
  it("only flags non-safe methods from another origin", () => {
    const evil = { origin: "https://evil.example", host: "localhost:3000" };
    expect(isCrossOriginMutation(request("POST", evil))).toBe(true);
    expect(isCrossOriginMutation(request("DELETE", evil))).toBe(true);
    expect(isCrossOriginMutation(request("GET", evil))).toBe(false);
    expect(isCrossOriginMutation(request("POST", { origin: "http://localhost:3000", host: "localhost:3000" }))).toBe(false);
  });
});
