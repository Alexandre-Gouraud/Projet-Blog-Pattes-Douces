/// <reference lib="webworker" />
/**
 * Web Worker de traduction : Transformers.js et les modeles Opus-MT tournent
 * hors du fil principal, pour que la page reste fluide pendant le calcul.
 * Tous les fichiers (modeles et moteur ONNX en WebAssembly) sont servis par le
 * site lui-meme (public/models, public/ort) : aucun appel a un service tiers.
 */
import { env, pipeline, type TranslationPipeline } from "@huggingface/transformers";
import type { ModelId } from "./models";
import { joinTranslated, splitForTranslation } from "./models";
import type { WorkerRequest, WorkerResponse } from "./protocol";

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = "/models/";

// La librairie choisit la variante WebAssembly adaptee au navigateur et pointe
// vers un CDN : on garde son choix mais on sert les fichiers depuis /ort/.
const wasmPaths = env.backends.onnx.wasm?.wasmPaths;
if (wasmPaths && typeof wasmPaths === "object") {
  for (const key of ["mjs", "wasm"] as const) {
    const url = wasmPaths[key];
    if (typeof url === "string") wasmPaths[key] = `/ort/${url.slice(url.lastIndexOf("/") + 1)}`;
  }
}

const post = (message: WorkerResponse) => self.postMessage(message);

const pipelines = new Map<ModelId, Promise<TranslationPipeline>>();

/** Charge un modele une seule fois ; l'avancement agrege tous ses fichiers. */
function loadModel(model: ModelId, onProgress?: (loaded: number) => void): Promise<TranslationPipeline> {
  let loading = pipelines.get(model);
  if (!loading) {
    const files = new Map<string, { loaded: number; total: number }>();
    loading = pipeline("translation", model, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (event) => {
        if (event.status !== "progress") return;
        files.set(event.file, { loaded: event.loaded, total: event.total });
        let loaded = 0;
        let total = 0;
        for (const file of files.values()) {
          loaded += file.loaded;
          total += file.total;
        }
        if (total > 0) onProgress?.(loaded / total);
      },
    }) as Promise<TranslationPipeline>;
    pipelines.set(model, loading);
    // Un echec (fichier manquant, memoire...) ne doit pas bloquer les essais suivants.
    loading.catch(() => pipelines.delete(model));
  }
  return loading;
}

async function translateSegment(segment: string, models: TranslationPipeline[]): Promise<string> {
  if (!segment.trim()) return segment;
  let text = segment;
  for (const model of models) {
    const [output] = (await model(text)) as { translation_text: string }[];
    text = output.translation_text;
  }
  return text;
}

async function handle(request: WorkerRequest) {
  if (request.type === "warm") {
    await Promise.all(request.models.map((model) => loadModel(model)));
    return;
  }

  const { id, texts, models } = request;
  // Avancement du chargement : moyenne sur les modeles de la route (1 ou 2 avec le pivot).
  const progress = models.map(() => 0);
  const loaded = await Promise.all(
    models.map((model, index) =>
      loadModel(model, (value) => {
        progress[index] = value;
        post({ type: "progress", id, loaded: progress.reduce((a, b) => a + b, 0) / models.length });
      }),
    ),
  );

  const results: string[] = [];
  for (const [index, text] of texts.entries()) {
    const { segments, separators } = splitForTranslation(text);
    const done: string[] = [];
    for (const segment of segments) {
      done.push(await translateSegment(segment, loaded));
      // Le texte s'affiche au fil de la traduction : segments traduits, puis la suite d'origine.
      post({ type: "partial", id, index, text: joinTranslated([...done, ...segments.slice(done.length)], separators) });
    }
    results.push(joinTranslated(done, separators));
  }
  post({ type: "done", id, texts: results });
}

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  handle(event.data).catch((error: unknown) => {
    if (event.data.type === "translate") {
      post({ type: "error", id: event.data.id, message: error instanceof Error ? error.message : String(error) });
    }
  });
});
