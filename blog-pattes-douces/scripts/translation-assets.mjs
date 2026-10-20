#!/usr/bin/env node
/**
 * Telecharge les modeles de la traduction des contenus dans public/models :
 * Opus-MT (Helsinki-NLP, convertis en ONNX par Xenova) en precision q8, un par
 * sens de traduction avec l'anglais comme pivot. Telecharges une fois depuis
 * Hugging Face (environ 680 Mo), puis servis par le site.
 *
 * Le moteur ONNX Runtime (WebAssembly) n'est pas copie ici : il est emis par le
 * build Next.js, dans /_next/static/ (voir translation.worker.ts).
 *
 * Les modeles ne sont pas versionnes (voir .gitignore). A lancer apres
 * l'installation : `pnpm translation:setup` (fait aussi par le Dockerfile).
 * Les fichiers deja presents sont conserves : relancer le script est rapide.
 */
import { mkdir, rename, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS_DIR = join(ROOT, "public", "models");

/** Doit rester aligne sur MODEL_IDS dans src/features/translation/models.ts. */
const MODELS = ["fr-en", "en-fr", "ar-en", "en-ar", "zh-en", "en-zh"].map((pair) => `Xenova/opus-mt-${pair}`);

/** Fichiers lus par Transformers.js pour un modele de traduction en dtype q8. */
const MODEL_FILES = [
  "config.json",
  "generation_config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "onnx/encoder_model_quantized.onnx",
  "onnx/decoder_model_merged_quantized.onnx",
];

async function exists(path) {
  try {
    return (await stat(path)).size > 0;
  } catch {
    return false;
  }
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`${response.status} ${response.statusText} pour ${url}`);
  await mkdir(dirname(destination), { recursive: true });
  // Ecrit dans un fichier temporaire : un telechargement interrompu n'est jamais pris pour complet.
  const partial = `${destination}.part`;
  await pipeline(Readable.fromWeb(response.body), createWriteStream(partial));
  await rename(partial, destination);
}

async function downloadModels() {
  for (const model of MODELS) {
    for (const file of MODEL_FILES) {
      const destination = join(MODELS_DIR, model, file);
      if (await exists(destination)) continue;
      process.stdout.write(`Telechargement ${model}/${file}\n`);
      await download(`https://huggingface.co/${model}/resolve/main/${file}`, destination);
    }
  }
}

await downloadModels();
process.stdout.write(`Modeles de traduction prets dans ${MODELS_DIR}\n`);
