import { describe, expect, it } from "vitest";
import { ROUTES, safeNext } from "./routes";

describe("safeNext", () => {
  it("accepts internal paths", () => {
    expect(safeNext("/profile")).toBe("/profile");
    expect(safeNext("/articles?x=1")).toBe("/articles?x=1");
  });

  it("rejects external or missing targets", () => {
    expect(safeNext("//evil.com")).toBeNull();
    expect(safeNext("https://evil.com")).toBeNull();
    expect(safeNext("evil")).toBeNull();
    expect(safeNext("")).toBeNull();
    expect(safeNext(null)).toBeNull();
  });
});

describe("ROUTES login helpers", () => {
  it("loginThen encodes the target", () => {
    expect(ROUTES.loginThen("/articles/new?a=1&b=2")).toBe("/login?suite=%2Farticles%2Fnew%3Fa%3D1%26b%3D2");
  });

  it("loginRequired adds the reason and encodes the target", () => {
    expect(ROUTES.loginRequired("/profile")).toBe("/login?raison=connexion&suite=%2Fprofile");
  });
});
