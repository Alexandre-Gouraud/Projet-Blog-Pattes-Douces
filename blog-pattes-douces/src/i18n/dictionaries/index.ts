import type { Locale } from "../config";
import { ar } from "./ar";
import { en } from "./en";
import { fr, type Dictionary } from "./fr";
import { zh } from "./zh";

export type { Dictionary };

/** Les quatre dictionnaires sont petits : ils sont tous embarques cote client. */
export const DICTIONARIES: Record<Locale, Dictionary> = { fr, en, ar, zh };
