#!/usr/bin/env node
/**
 * Telecharge les modeles de la traduction des contenus dans public/models :
 * Opus-MT (Helsinki-NLP, convertis en ONNX par Xenova) en precision q8, un par
 * sens de traduction avec l'anglais comme pivot. Telecharges une fois depuis
 * Hugging Face (environ 680 Mo), puis servis par le site.
 *
 * Deux modeles directs francais<->arabe (opus-mt-fr-ar et opus-mt-ar-fr)
 * n'existent pas en ONNX chez Xenova : ils sont convertis depuis les modeles
 * officiels Helsinki-NLP par scripts/convert-opus-mt.py (Python 3.12+, une seule
 * fois, quelques minutes, dans un environnement virtuel .venv-translation).
 * Sans Python, un avertissement est affiche (code de sortie 0) et ces deux
 * paires passent par l'anglais. Un echec de la conversion ou de sa validation
 * donne un code de sortie non nul. L'option --no-convert saute cette etape (le
 * Dockerfile la fait dans une etape Python a part).
 *
 * Le moteur ONNX Runtime (WebAssembly) n'est pas copie ici : il est emis par le
 * build Next.js, dans /_next/static/ (voir translation.worker.ts).
 *
 * Les modeles ne sont pas versionnes (voir .gitignore). A lancer apres
 * l'installation : `pnpm translation:setup` (fait aussi par le Dockerfile).
 * Les fichiers deja presents sont conserves : relancer le script est rapide.
 */
import { spawnSync } from "node:child_process";
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

/** Modeles convertis localement ; doit rester aligne sur PAIRS dans scripts/convert-opus-mt.py. */
const LOCAL_MODELS = ["fr-ar", "ar-fr"].map((pair) => `local/opus-mt-${pair}`);

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

async function localModelsReady() {
  const checks = LOCAL_MODELS.flatMap((model) => MODEL_FILES.map((file) => exists(join(MODELS_DIR, model, file))));
  return (await Promise.all(checks)).every(Boolean);
}

/** Lance une commande en affichant sa sortie ; renvoie true si elle a reussi. */
function run(command, args) {
  return spawnSync(command, args, { cwd: ROOT, stdio: "inherit" }).status === 0;
}

/** Premier interpreteur Python 3.12+ disponible (verrou de dependances), ou null. */
function findPython() {
  const check = "import sys; sys.exit(0 if sys.version_info >= (3, 12) else 1)";
  return ["python3", "python"].find((name) => spawnSync(name, ["-c", check], { stdio: "ignore" }).status === 0) ?? null;
}

function fail(reason) {
  process.stderr.write(`ERREUR : modeles francais<->arabe non installes, ${reason} (voir ci-dessus).\n`);
  process.exitCode = 1;
}

/** Convertit les modeles fr<->ar. Un echec positionne un code de sortie non nul. */
async function convertLocalModels() {
  if (await localModelsReady()) return;
  const python = findPython();
  if (!python) {
    process.stdout.write(
      "ATTENTION : Python 3.12+ est introuvable. Les modeles francais<->arabe ne sont pas installes :\n" +
        "ces paires passent par l'anglais (moins precis). Installez Python puis relancez `pnpm translation:setup`.\n",
    );
    return;
  }
  // Environnement virtuel dedie (ignore par le depot) : n'altere pas le Python du systeme.
  const venv = join(ROOT, ".venv-translation");
  const windows = process.platform === "win32";
  const venvPython = join(venv, windows ? "Scripts" : "bin", windows ? "python.exe" : "python");
  process.stdout.write("Conversion des modeles francais<->arabe (installation de torch CPU, plusieurs minutes)...\n");
  if (!(await exists(venvPython)) && !run(python, ["-m", "venv", venv])) {
    return fail("creation de l'environnement virtuel impossible (Debian/Ubuntu : installez le paquet python3-venv)");
  }
  // Dependances verrouillees avec leurs empreintes : torch (CPU) depuis l'index PyTorch, le reste depuis PyPI.
  const pip = ["-m", "pip", "install", "--quiet", "--require-hashes"];
  const torch = ["--index-url", "https://download.pytorch.org/whl/cpu", "--no-deps", "-r", "scripts/requirements-torch.txt"];
  if (!run(venvPython, [...pip, ...torch])) return fail("installation de torch impossible");
  if (!run(venvPython, [...pip, "-r", "scripts/requirements-translation.txt"])) {
    return fail("installation des dependances Python impossible");
  }
  if (!run(venvPython, ["scripts/convert-opus-mt.py", "--output", MODELS_DIR])) {
    return fail("conversion ou validation des modeles impossible");
  }
}

await downloadModels();
if (!process.argv.includes("--no-convert")) await convertLocalModels();
if (!process.exitCode) process.stdout.write(`Modeles de traduction prets dans ${MODELS_DIR}\n`);
