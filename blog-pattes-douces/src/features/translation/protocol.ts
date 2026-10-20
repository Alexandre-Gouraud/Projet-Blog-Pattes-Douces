import type { ModelId } from "./models";

/** Messages echanges entre la page et le Web Worker de traduction. */
export type WorkerRequest =
  | { type: "warm"; models: ModelId[] }
  // `fallback` : route par l'anglais, utilisee si un modele direct (fr<->ar) ne peut pas etre charge.
  | { type: "translate"; id: number; texts: string[]; models: ModelId[]; fallback?: ModelId[] };

export type WorkerResponse =
  | { type: "progress"; id: number; loaded: number }
  | { type: "partial"; id: number; index: number; text: string }
  | { type: "done"; id: number; texts: string[] }
  | { type: "error"; id: number; message: string };
