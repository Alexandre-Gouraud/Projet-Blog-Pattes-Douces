import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (event: { data?: unknown }) => void;

class FakeWorker {
  static instances: FakeWorker[] = [];
  posted: Array<Record<string, unknown>> = [];
  listeners: Record<string, Listener[]> = {};

  constructor() {
    FakeWorker.instances.push(this);
  }
  addEventListener(type: string, listener: Listener) {
    (this.listeners[type] ??= []).push(listener);
  }
  postMessage(message: Record<string, unknown>) {
    this.posted.push(message);
  }
  emit(data: unknown) {
    for (const listener of this.listeners.message ?? []) listener({ data });
  }
  emitError() {
    for (const listener of this.listeners.error ?? []) listener({});
  }
  get translations() {
    return this.posted.filter((m) => m.type === "translate");
  }
}

let mod: typeof import("./translator");

beforeEach(async () => {
  FakeWorker.instances = [];
  vi.stubGlobal("Worker", FakeWorker);
  vi.resetModules();
  mod = await import("./translator");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const lastWorker = () => FakeWorker.instances[FakeWorker.instances.length - 1];

describe("sourceLocale", () => {
  it("garde une langue supportee", () => {
    expect(mod.sourceLocale("en")).toBe("en");
    expect(mod.sourceLocale("ar")).toBe("ar");
  });

  it("retombe sur fr pour null, undefined ou langue inconnue", () => {
    expect(mod.sourceLocale(null)).toBe("fr");
    expect(mod.sourceLocale(undefined)).toBe("fr");
    expect(mod.sourceLocale("de")).toBe("fr");
  });
});

describe("translateTexts", () => {
  it("envoie une requete translate avec la route et les textes", async () => {
    const promise = mod.translateTexts(["t1a", "t1b"], "fr", "ar");
    const worker = lastWorker();
    expect(worker.translations).toHaveLength(1);
    const request = worker.translations[0];
    expect(request.type).toBe("translate");
    expect(request.models).toEqual(["Xenova/opus-mt-fr-en", "Xenova/opus-mt-en-ar"]);
    expect(request.texts).toEqual(["t1a", "t1b"]);
    worker.emit({ type: "done", id: request.id, texts: ["x", "y"] });
    await expect(promise).resolves.toEqual(["x", "y"]);
  });

  it("transmet la progression", async () => {
    const onProgress = vi.fn();
    const promise = mod.translateTexts(["t2"], "fr", "en", { onProgress });
    const worker = lastWorker();
    const id = worker.translations[0].id;
    worker.emit({ type: "progress", id, loaded: 0.25 });
    worker.emit({ type: "progress", id, loaded: 1 });
    worker.emit({ type: "done", id, texts: ["T2"] });
    await promise;
    expect(onProgress.mock.calls).toEqual([[0.25], [1]]);
  });

  it("ignore les messages d'un id inconnu", async () => {
    const onProgress = vi.fn();
    const promise = mod.translateTexts(["t3"], "fr", "en", { onProgress });
    const worker = lastWorker();
    const id = worker.translations[0].id as number;
    worker.emit({ type: "progress", id: id + 100, loaded: 0.5 });
    worker.emit({ type: "done", id, texts: ["T3"] });
    await promise;
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("remappe l'index des traductions partielles sur le tableau d'origine", async () => {
    const first = mod.translateTexts(["A", "B"], "fr", "en");
    const worker = lastWorker();
    worker.emit({ type: "done", id: worker.translations[0].id, texts: ["a", "b"] });
    await first;

    const onPartial = vi.fn();
    const second = mod.translateTexts(["A", "C"], "fr", "en", { onPartial });
    expect(worker.translations).toHaveLength(2);
    const request = worker.translations[1];
    expect(request.texts).toEqual(["C"]);
    worker.emit({ type: "partial", id: request.id, index: 0, text: "c..." });
    expect(onPartial).toHaveBeenCalledWith(1, "c...");
    worker.emit({ type: "done", id: request.id, texts: ["c"] });
    await expect(second).resolves.toEqual(["a", "c"]);
  });

  it("rend les resultats dans l'ordre", async () => {
    const promise = mod.translateTexts(["o1", "o2", "o3"], "en", "fr");
    const worker = lastWorker();
    worker.emit({ type: "done", id: worker.translations[0].id, texts: ["1", "2", "3"] });
    await expect(promise).resolves.toEqual(["1", "2", "3"]);
  });

  it("sert un second appel identique depuis le cache", async () => {
    const first = mod.translateTexts(["cache me"], "fr", "en");
    const worker = lastWorker();
    worker.emit({ type: "done", id: worker.translations[0].id, texts: ["cached"] });
    await first;
    await expect(mod.translateTexts(["cache me"], "fr", "en")).resolves.toEqual(["cached"]);
    expect(worker.translations).toHaveLength(1);
  });

  it("rejette sur un message d'erreur du worker", async () => {
    const promise = mod.translateTexts(["t7"], "fr", "en");
    const worker = lastWorker();
    worker.emit({ type: "error", id: worker.translations[0].id, message: "boom" });
    await expect(promise).rejects.toThrow("boom");
  });

  it("rejette toutes les demandes en cours sur un evenement error puis recree un worker", async () => {
    const p1 = mod.translateTexts(["t8a"], "fr", "en");
    const p2 = mod.translateTexts(["t8b"], "fr", "en");
    const first = lastWorker();
    first.emitError();
    await expect(p1).rejects.toThrow();
    await expect(p2).rejects.toThrow();

    const p3 = mod.translateTexts(["t8c"], "fr", "en");
    expect(FakeWorker.instances).toHaveLength(2);
    const second = lastWorker();
    expect(second).not.toBe(first);
    second.emit({ type: "done", id: second.translations[0].id, texts: ["ok"] });
    await expect(p3).resolves.toEqual(["ok"]);
  });
});

describe("warmUp", () => {
  it("demande le prechauffage des modeles d'une paire", () => {
    mod.warmUp("fr", "ar");
    expect(lastWorker().posted).toEqual([
      { type: "warm", models: ["Xenova/opus-mt-fr-en", "Xenova/opus-mt-en-ar"] },
    ]);
  });

  it("ne fait rien pour la meme langue", () => {
    mod.warmUp("fr", "fr");
    expect(FakeWorker.instances).toHaveLength(0);
  });
});
