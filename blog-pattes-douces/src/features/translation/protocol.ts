import type { ModelId } from "./models";

/** Messages echanges entre la page et le Web Worker de traduction. */
export type WorkerRequest =
  | { type: "warm"; models: ModelId[] }
  | { type: "translate"; id: number; texts: string[]; models: ModelId[] };

export type WorkerResponse =
  | { type: "progress"; id: number; loaded: number }
  | { type: "partial"; id: number; index: number; text: string }
  | { type: "done"; id: number; texts: string[] }
  | { type: "error"; id: number; message: string };
