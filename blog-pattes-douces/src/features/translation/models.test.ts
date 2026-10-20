import { describe, expect, it } from "vitest";
import { MODEL_IDS, joinTranslated, modelRoute, splitForTranslation } from "./models";

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

  it("passe par l'anglais pour fr->ar et ar->zh", () => {
    expect(modelRoute("fr", "ar")).toEqual([MODEL_IDS["fr>en"], MODEL_IDS["en>ar"]]);
    expect(modelRoute("ar", "zh")).toEqual([MODEL_IDS["ar>en"], MODEL_IDS["en>zh"]]);
  });

  it("resout les 12 paires ordonnees vers des modeles definis", () => {
    let pairs = 0;
    for (const source of LOCALES) {
      for (const target of LOCALES) {
        if (source === target) continue;
        pairs++;
        const route = modelRoute(source, target);
        expect(route).toHaveLength(source === "en" || target === "en" ? 1 : 2);
        for (const id of route) {
          expect(id).toBeDefined();
          expect(Object.values(MODEL_IDS)).toContain(id);
        }
      }
    }
    expect(pairs).toBe(12);
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
