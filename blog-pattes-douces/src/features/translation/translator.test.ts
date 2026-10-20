import { afterEach, describe, expect, it, vi } from "vitest";
import { externalTranslationUrl, sourceLocale, translateTexts, translationMode } from "./translator";

function installTranslator(api: unknown) {
  vi.stubGlobal("self", { Translator: api });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sourceLocale", () => {
  it("garde une langue supportee", () => {
    expect(sourceLocale("ar")).toBe("ar");
  });

  it("considere les contenus sans langue (ou inconnue) comme francais", () => {
    expect(sourceLocale(null)).toBe("fr");
    expect(sourceLocale(undefined)).toBe("fr");
    expect(sourceLocale("de")).toBe("fr");
  });
});

describe("externalTranslationUrl", () => {
  it("construit une URL Google Traduction encodee", () => {
    const url = new URL(externalTranslationUrl("Bonjour & bravo !", "fr", "en"));
    expect(url.origin).toBe("https://translate.google.com");
    expect(url.searchParams.get("sl")).toBe("fr");
    expect(url.searchParams.get("tl")).toBe("en");
    expect(url.searchParams.get("text")).toBe("Bonjour & bravo !");
  });

  it("utilise zh-CN pour le chinois simplifie", () => {
    const url = new URL(externalTranslationUrl("Bonjour", "fr", "zh"));
    expect(url.searchParams.get("tl")).toBe("zh-CN");
  });

  it("tronque les textes trop longs pour une URL", () => {
    const url = new URL(externalTranslationUrl("a".repeat(10_000), "fr", "en"));
    expect(url.searchParams.get("text")).toHaveLength(4000);
  });
});

describe("translationMode", () => {
  it("passe par le lien externe sans API Translator", async () => {
    vi.stubGlobal("self", {});
    await expect(translationMode("fr", "en")).resolves.toBe("external");
  });

  it("utilise le navigateur si la paire est disponible ou telechargeable", async () => {
    installTranslator({ availability: async () => "downloadable" });
    await expect(translationMode("fr", "en")).resolves.toBe("builtin");
  });

  it("passe par le lien externe si la paire n'est pas prise en charge", async () => {
    installTranslator({ availability: async () => "unavailable" });
    await expect(translationMode("fr", "ar")).resolves.toBe("external");
  });

  it("passe par le lien externe si l'API echoue", async () => {
    installTranslator({ availability: async () => Promise.reject(new Error("boom")) });
    await expect(translationMode("fr", "zh")).resolves.toBe("external");
  });
});

describe("translateTexts", () => {
  it("traduit chaque texte et reutilise le traducteur de la paire", async () => {
    const create = vi.fn(async () => ({ translate: async (text: string) => `EN:${text}` }));
    installTranslator({ availability: async () => "available", create });

    await expect(translateTexts(["Titre", "Texte"], "fr", "en")).resolves.toEqual(["EN:Titre", "EN:Texte"]);
    await translateTexts(["Encore"], "fr", "en");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("transmet l'avancement du telechargement du modele", async () => {
    const onProgress = vi.fn();
    installTranslator({
      create: async ({ monitor }: { monitor: (m: { addEventListener: (t: string, l: (e: { loaded: number }) => void) => void }) => void }) => {
        monitor({ addEventListener: (_type, listener) => listener({ loaded: 0.5 }) });
        return { translate: async (text: string) => text };
      },
    });
    await translateTexts(["x"], "en", "ar", onProgress);
    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it("permet un nouvel essai apres un echec de creation", async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(new Error("NotSupportedError"))
      .mockResolvedValueOnce({ translate: async (text: string) => `FR:${text}` });
    installTranslator({ create });

    await expect(translateTexts(["Hi"], "en", "fr")).rejects.toThrow();
    await expect(translateTexts(["Hi"], "en", "fr")).resolves.toEqual(["FR:Hi"]);
  });
});
