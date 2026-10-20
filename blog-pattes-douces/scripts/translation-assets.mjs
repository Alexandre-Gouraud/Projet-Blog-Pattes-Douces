#!/usr/bin/env node
/**
 * Prepare les fichiers de la traduction des contenus, auto-heberges sur le site :
 *
 * - public/models : modeles Opus-MT (Helsinki-NLP, convertis en ONNX par
 *   Xenova) en precision q8, un par sens de traduction avec l'anglais comme
 *   pivot. Telecharges une fois depuis Hugging Face (environ 680 Mo).
 * - public/ort : moteur ONNX Runtime en WebAssembly, copie depuis node_modules.
 *
 * Aucun de ces fichiers n'est versionne (voir .gitignore). A lancer apres
 * l'installation : `pnpm translation:setup` (fait aussi par le Dockerfile).
 * Les fichiers deja presents sont conserves : relancer le script est rapide.
 */
import { copyFile, mkdir, rename, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS_DIR = join(ROOT, "public", "models");
const ORT_DIR = join(ROOT, "public", "ort");

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

/** Variantes WebAssembly choisies par Transformers.js (asyncify, ou simple pour Safari < 26). */
const ORT_FILES = [
  "ort-wasm-simd-threaded.asyncify.mjs",
  "ort-wasm-simd-threaded.asyncify.wasm",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
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

async function copyRuntime() {
  // onnxruntime-web est une dependance de Transformers.js : on le resout depuis celle-ci.
  const require = createRequire(import.meta.url);
  const transformers = require.resolve("@huggingface/transformers");
  const ortEntry = createRequire(transformers).resolve("onnxruntime-web");
  const ortDist = dirname(ortEntry);
  await mkdir(ORT_DIR, { recursive: true });
  for (const file of ORT_FILES) {
    await copyFile(join(ortDist, file), join(ORT_DIR, file));
  }
}

await copyRuntime();
process.stdout.write(`Moteur ONNX copie dans ${ORT_DIR}\n`);
await downloadModels();
process.stdout.write(`Modeles de traduction prets dans ${MODELS_DIR}\n`);
