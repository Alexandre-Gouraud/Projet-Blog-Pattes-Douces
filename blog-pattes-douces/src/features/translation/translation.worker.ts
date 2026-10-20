/// <reference lib="webworker" />
/**
 * Web Worker de traduction : Transformers.js et les modeles Opus-MT tournent
 * hors du fil principal, pour que la page reste fluide pendant le calcul.
 * Les modeles sont servis par le site (public/models) et le moteur ONNX en
 * WebAssembly par le build Next.js (/_next/static) : aucun appel a un service tiers.
 */
import { env, pipeline, type TranslationPipeline } from "@huggingface/transformers";
import type { ModelId } from "./models";
import { joinTranslated, loadRoute, splitForTranslation } from "./models";
import type { WorkerRequest, WorkerResponse } from "./protocol";

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = "/models/";

// Transformers.js pointe ONNX Runtime vers un CDN (jsDelivr) au chargement du
// module. On retire ce choix : sans wasmPaths, ONNX Runtime charge son .wasm via
// new URL(..., import.meta.url), que le bundler emet dans /_next/static/. Un
// seul exemplaire du moteur, servi par le site et mis en cache de facon immuable.
// A reverifier a chaque montee de version de @huggingface/transformers : si la
// forme de wasmPaths change, le moteur repartirait silencieusement vers le CDN
// (allowRemoteModels ne couvre que les modeles). Seule la variante « asyncify »
// est servie : Safari < 26 sans WebGPU n'est pas pris en charge (DESIGN.md §9.15).
if (env.backends.onnx.wasm) env.backends.onnx.wasm.wasmPaths = undefined;

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

  const { id, texts, models, fallback } = request;
  // Avancement du chargement : moyenne sur les modeles de la route (1 ou 2 avec le pivot).
  // Si un modele direct manque, la route de secours (par l'anglais) prend le relais.
  const progress: number[] = [];
  const loaded = await loadRoute(models, fallback, (model, index, count) => {
    if (index === 0) progress.length = 0;
    progress[index] = 0;
    return loadModel(model, (value) => {
      progress[index] = value;
      post({ type: "progress", id, loaded: progress.reduce((a, b) => a + b, 0) / count });
    });
  });

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
