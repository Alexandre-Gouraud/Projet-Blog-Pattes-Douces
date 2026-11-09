import { describe, expect, it } from "vitest";
import { MODEL_IDS } from "./models";
import { isTrustedOrigin, isWorkerRequest } from "./protocol";

const model = MODEL_IDS["fr>en"];

describe("isWorkerRequest", () => {
  it("accepte warm et translate valides", () => {
    expect(isWorkerRequest({ type: "warm", models: [model] })).toBe(true);
    expect(isWorkerRequest({ type: "translate", id: 1, texts: ["a"], models: [model] })).toBe(true);
    expect(isWorkerRequest({ type: "translate", id: 1, texts: [], models: [model], fallback: [model] })).toBe(true);
  });

  it("rejette les formes invalides", () => {
    expect(isWorkerRequest(null)).toBe(false);
    expect(isWorkerRequest("warm")).toBe(false);
    expect(isWorkerRequest({ type: "other" })).toBe(false);
    expect(isWorkerRequest({ type: "warm", models: ["inconnu"] })).toBe(false);
    expect(isWorkerRequest({ type: "translate", id: "1", texts: ["a"], models: [model] })).toBe(false);
    expect(isWorkerRequest({ type: "translate", id: 1, texts: [2], models: [model] })).toBe(false);
    expect(isWorkerRequest({ type: "translate", id: 1, texts: ["a"], models: [model], fallback: "x" })).toBe(false);
  });
});

describe("isTrustedOrigin", () => {
  it("accepte l'origine vide ou identique, refuse le reste", () => {
    expect(isTrustedOrigin("", "https://a.test")).toBe(true);
    expect(isTrustedOrigin("https://a.test", "https://a.test")).toBe(true);
    expect(isTrustedOrigin("https://evil.test", "https://a.test")).toBe(false);
  });
});
