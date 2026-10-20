import { describe, expect, it } from "vitest";
import ar from "./messages/ar.json";
import en from "./messages/en.json";
import fr from "./messages/fr.json";
import { format, formatDate, plural, rich } from "./format";

describe("format", () => {
  it("replaces variables", () => {
    expect(format("Bonjour {name}, {count} chats", { name: "Léa", count: 3 })).toBe("Bonjour Léa, 3 chats");
  });

  it("leaves unknown variables as-is", () => {
    expect(format("Salut {name} {other}", { name: "Léa" })).toBe("Salut Léa {other}");
    expect(format("Salut {name}")).toBe("Salut {name}");
  });
});

describe("plural", () => {
  it("fr: 0 and 1 are singular, 2 is plural", () => {
    const f = fr.common.count.comments;
    expect(plural("fr", f, 0)).toBe(format(f.one, { count: 0 }));
    expect(plural("fr", f, 1)).toBe(format(f.one, { count: 1 }));
    expect(plural("fr", f, 2)).toBe(format(f.other, { count: 2 }));
  });

  it("en: 1 vs other", () => {
    const f = en.common.count.comments;
    expect(plural("en", f, 1)).toBe(format(f.one, { count: 1 }));
    expect(plural("en", f, 0)).toBe(format(f.other, { count: 0 }));
    expect(plural("en", f, 5)).toBe(format(f.other, { count: 5 }));
  });

  it("ar: zero/one/two/few/many/other", () => {
    const f = ar.common.count.comments;
    expect(plural("ar", f, 0)).toBe(format(f.zero, { count: 0 }));
    expect(plural("ar", f, 1)).toBe(format(f.one, { count: 1 }));
    expect(plural("ar", f, 2)).toBe(format(f.two, { count: 2 }));
    expect(plural("ar", f, 3)).toBe(format(f.few, { count: 3 }));
    expect(plural("ar", f, 11)).toBe(format(f.many, { count: 11 }));
    expect(plural("ar", f, 100)).toBe(format(f.other, { count: 100 }));
  });

  it("zh: a single form", () => {
    const f = { other: "{count} 条评论" };
    expect(plural("zh", f, 0)).toBe("0 条评论");
    expect(plural("zh", f, 1)).toBe("1 条评论");
    expect(plural("zh", f, 7)).toBe("7 条评论");
  });

  it("falls back to other and merges extra values", () => {
    expect(plural("en", { other: "{count} of {total}" }, 1, { total: 9 })).toBe("1 of 9");
  });
});

describe("rich", () => {
  it("replaces the variable with the given node", () => {
    const node = { node: true };
    expect(rich("avant {text} après", { text: node as never })).toEqual(["avant ", node, " après"]);
  });

  it("keeps unknown variable names as plain text", () => {
    expect(rich("a {x} b", {})).toEqual(["a ", "x", " b"]);
  });
});

describe("formatDate", () => {
  const iso = "2026-10-19T12:00:00Z";

  it("fr: DD/MM/YYYY", () => {
    expect(formatDate("fr", iso)).toBe("19/10/2026");
  });

  it("en: DD/MM/YYYY (en-GB)", () => {
    expect(formatDate("en", iso)).toBe("19/10/2026");
  });

  it("zh: Latin digits, year first", () => {
    expect(formatDate("zh", iso)).toBe("2026/10/19");
  });

  it("ar: Latin digits", () => {
    const out = formatDate("ar", iso);
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/19/);
    expect(out).not.toMatch(/[٠-٩]/);
  });
});
