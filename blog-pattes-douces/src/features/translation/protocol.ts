import { MODEL_IDS, type ModelId } from "./models";

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

const KNOWN_MODELS: ReadonlySet<string> = new Set(Object.values(MODEL_IDS));

function isModelList(value: unknown): value is ModelId[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && KNOWN_MODELS.has(item));
}

/** Verifie la forme d'un message recu par le worker (type guard sur WorkerRequest). */
export function isWorkerRequest(data: unknown): data is WorkerRequest {
  if (typeof data !== "object" || data === null) return false;
  const message = data as Record<string, unknown>;
  if (message.type === "warm") return isModelList(message.models);
  if (message.type === "translate") {
    return (
      typeof message.id === "number" &&
      Array.isArray(message.texts) &&
      message.texts.every((text) => typeof text === "string") &&
      isModelList(message.models) &&
      (message.fallback === undefined || isModelList(message.fallback))
    );
  }
  return false;
}

/** Un worker dedie ne recoit que des messages de sa page : origine vide ou identique a la sienne. */
export function isTrustedOrigin(origin: string, selfOrigin: string): boolean {
  return origin === "" || origin === selfOrigin;
}
