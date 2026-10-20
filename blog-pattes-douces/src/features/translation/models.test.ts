import { describe, expect, it } from "vitest";
import { MODEL_IDS, joinTranslated, loadRoute, modelRoute, pivotFallback, splitForTranslation, type ModelId } from "./models";

const LOCALES = ["fr", "en", "ar", "zh"] as const;

describe("modelRoute", () => {
  it("renvoie une liste vide pour la meme langue", () => {
    expect(modelRoute("fr", "fr")).toEqual([]);
    expect(modelRoute("zh", "zh")).toEqual([]);
  });

  it("utilise un seul modele pour fr->en et en->fr", () => {
    expect(modelRoute("fr", "en")).toEqual([MODEL_IDS["fr>en"]]);
    expect(modelRoute("en", "fr")).toEqual([MODEL_IDS["en>fr"]]);
  });

  it("utilise un modele direct pour fr->ar et ar->fr", () => {
    expect(modelRoute("fr", "ar")).toEqual([MODEL_IDS["fr>ar"]]);
    expect(modelRoute("ar", "fr")).toEqual([MODEL_IDS["ar>fr"]]);
  });

  it("passe par l'anglais pour les paires avec le chinois", () => {
    expect(modelRoute("fr", "zh")).toEqual([MODEL_IDS["fr>en"], MODEL_IDS["en>zh"]]);
    expect(modelRoute("ar", "zh")).toEqual([MODEL_IDS["ar>en"], MODEL_IDS["en>zh"]]);
    expect(modelRoute("zh", "ar")).toEqual([MODEL_IDS["zh>en"], MODEL_IDS["en>ar"]]);
  });

  it("resout les 12 paires ordonnees vers des modeles definis", () => {
    let pairs = 0;
    for (const source of LOCALES) {
      for (const target of LOCALES) {
        if (source === target) continue;
        pairs++;
        const route = modelRoute(source, target);
        const viaEnglish = source !== "en" && target !== "en" && (source === "zh" || target === "zh");
        expect(route).toHaveLength(viaEnglish ? 2 : 1);
        for (const id of route) {
          expect(id).toBeDefined();
          expect(Object.values(MODEL_IDS)).toContain(id);
        }
      }
    }
    expect(pairs).toBe(12);
  });
});

describe("pivotFallback", () => {
  it("donne la route par l'anglais pour les paires directes fr<->ar", () => {
    expect(pivotFallback("fr", "ar")).toEqual([MODEL_IDS["fr>en"], MODEL_IDS["en>ar"]]);
    expect(pivotFallback("ar", "fr")).toEqual([MODEL_IDS["ar>en"], MODEL_IDS["en>fr"]]);
  });

  it("n'en donne pas quand la route passe deja par l'anglais ou n'a qu'un modele vers l'anglais", () => {
    expect(pivotFallback("fr", "zh")).toBeUndefined();
    expect(pivotFallback("fr", "en")).toBeUndefined();
    expect(pivotFallback("en", "ar")).toBeUndefined();
    expect(pivotFallback("fr", "fr")).toBeUndefined();
  });
});

describe("loadRoute", () => {
  const route = modelRoute("fr", "ar");
  const fallback = pivotFallback("fr", "ar");

  it("charge la route directe quand tout est disponible", async () => {
    const loaded: ModelId[] = [];
    const result = await loadRoute(route, fallback, async (model) => {
      loaded.push(model);
      return model;
    });
    expect(result).toEqual([MODEL_IDS["fr>ar"]]);
    expect(loaded).toEqual([MODEL_IDS["fr>ar"]]);
  });

  it("bascule sur le pivot quand le modele direct est absent", async () => {
    const result = await loadRoute(route, fallback, async (model) => {
      if (model === MODEL_IDS["fr>ar"]) throw new Error("404");
      return model;
    });
    expect(result).toEqual([MODEL_IDS["fr>en"], MODEL_IDS["en>ar"]]);
  });

  it("transmet l'index et le nombre de modeles de la route chargee", async () => {
    const seen: Array<[number, number]> = [];
    await loadRoute(route, fallback, async (model, index, count) => {
      seen.push([index, count]);
      if (model === MODEL_IDS["fr>ar"]) throw new Error("404");
    });
    expect(seen).toEqual([
      [0, 1],
      [0, 2],
      [1, 2],
    ]);
  });

  it("propage l'erreur quand il n'y a pas de route de secours", async () => {
    await expect(
      loadRoute(modelRoute("fr", "en"), undefined, async () => {
        throw new Error("404");
      }),
    ).rejects.toThrow("404");
  });

  it("propage l'erreur quand la route de secours echoue aussi", async () => {
    await expect(
      loadRoute(route, fallback, async () => {
        throw new Error("hors ligne");
      }),
    ).rejects.toThrow("hors ligne");
  });
});

function roundTrip(text: string) {
  const { segments, separators } = splitForTranslation(text);
  expect(segments).toHaveLength(separators.length);
  expect(joinTranslated(segments, separators)).toBe(text);
  return { segments, separators };
}

describe("splitForTranslation / joinTranslated", () => {
  it("reconstruit une phrase seule", () => {
    const { segments } = roundTrip("Bonjour le monde.");
    expect(segments).toEqual(["Bonjour le monde."]);
  });

  it("reconstruit plusieurs paragraphes avec un ou plusieurs sauts de ligne", () => {
    const { segments } = roundTrip("Un.\nDeux.\n\n\nTrois.");
    expect(segments).toEqual(["Un.", "Deux.", "Trois."]);
  });

  it("conserve les sauts de ligne en debut et en fin de texte", () => {
    roundTrip("\n\nDebut.\nFin.\n\n");
  });

  it("reconstruit une chaine vide", () => {
    roundTrip("");
  });

  it("decoupe un long paragraphe en phrases rognees", () => {
    const text = Array.from({ length: 12 }, (_, i) => `Voici la phrase numero ${i} qui parle des chats et des chiens.`).join(" ");
    expect(text.length).toBeGreaterThan(400);
    const { segments } = roundTrip(text);
    expect(segments.length).toBeGreaterThan(1);
    for (const segment of segments) expect(segment).toBe(segment.trim());
  });

  it("decoupe aussi sur la ponctuation chinoise", () => {
    const text = Array.from({ length: 40 }, (_, i) => `这是第${i}个句子。你好吗？太好了！`).join("");
    expect(text.length).toBeGreaterThan(400);
    const { segments } = roundTrip(text);
    expect(segments.length).toBeGreaterThan(1);
  });
});
