import type fr from "./messages/fr.json";
import type { PluralForms } from "./format";

/**
 * Forme commune des messages, deduite du francais (langue de reference).
 * Les objets de pluriel acceptent toutes les formes CLDR, puisque chaque
 * langue en utilise un nombre different (1 en chinois, 6 en arabe).
 */
type Shape<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Shape<U>[]
    : T extends { other: string }
      ? PluralForms
      : { [K in keyof T]: Shape<T[K]> };

export type Messages = Shape<typeof fr>;
