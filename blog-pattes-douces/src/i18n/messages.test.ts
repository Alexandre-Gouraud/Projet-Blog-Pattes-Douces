import { describe, expect, it } from "vitest";
import ar from "./messages/ar.json";
import en from "./messages/en.json";
import fr from "./messages/fr.json";
import zh from "./messages/zh.json";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Obj = { [key: string]: Json };

/** CLDR plural object: an object with an "other" key. Treated as a leaf. */
function isPlural(value: Json | undefined): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value) && "other" in value;
}

function walk(value: Json, path: string, out: Map<string, Json>) {
  if (typeof value === "object" && value !== null && !Array.isArray(value) && !isPlural(value)) {
    for (const [key, child] of Object.entries(value as Obj)) walk(child, path ? `${path}.${key}` : key, out);
  } else {
    out.set(path, value);
  }
}

function flatten(messages: unknown) {
  const out = new Map<string, Json>();
  walk(messages as Json, "", out);
  return out;
}

const variables = (s: string) => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

const flat = { fr: flatten(fr), en: flatten(en), ar: flatten(ar), zh: flatten(zh) };
const frKeys = [...flat.fr.keys()].sort();
const others = ["en", "ar", "zh"] as const;

describe("messages parity", () => {
  it("fr has keys", () => {
    expect(frKeys.length).toBeGreaterThan(0);
  });

  for (const locale of others) {
    describe(locale, () => {
      it("has exactly the same key paths as fr", () => {
        const keys = [...flat[locale].keys()].sort();
        expect(keys.filter((k) => !frKeys.includes(k))).toEqual([]);
        expect(frKeys.filter((k) => !keys.includes(k))).toEqual([]);
      });

      it("uses the same value kind (string or plural) as fr", () => {
        const mismatches = frKeys.filter((k) => {
          const b = flat[locale].get(k);
          return b !== undefined && isPlural(flat.fr.get(k)) !== isPlural(b);
        });
        expect(mismatches).toEqual([]);
      });

      it("uses the same {variables} as fr", () => {
        const mismatches: string[] = [];
        for (const key of frKeys) {
          const a = flat.fr.get(key);
          const b = flat[locale].get(key);
          if (typeof a !== "string" || typeof b !== "string") continue;
          if (variables(a).join() !== variables(b).join()) {
            mismatches.push(`${key}: [${variables(a)}] vs [${variables(b)}]`);
          }
        }
        expect(mismatches).toEqual([]);
      });
    });
  }

  for (const locale of ["fr", ...others] as const) {
    it(`${locale}: every plural object has a string "other" and only string forms`, () => {
      const bad: string[] = [];
      for (const [key, value] of flat[locale]) {
        if (!isPlural(value)) continue;
        if (typeof value.other !== "string") bad.push(key);
        if (Object.values(value).some((form) => typeof form !== "string")) bad.push(key);
      }
      expect(bad).toEqual([]);
    });
  }

  it("plural forms of other locales only use variables present in fr's other form", () => {
    const mismatches: string[] = [];
    for (const key of frKeys) {
      const a = flat.fr.get(key);
      if (!isPlural(a) || typeof a.other !== "string") continue;
      const allowed = new Set(variables(a.other));
      for (const locale of others) {
        const b = flat[locale].get(key);
        if (!isPlural(b)) continue;
        for (const [form, text] of Object.entries(b)) {
          if (typeof text !== "string") continue;
          for (const v of variables(text)) if (!allowed.has(v)) mismatches.push(`${locale}.${key}.${form}: {${v}}`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });
});
