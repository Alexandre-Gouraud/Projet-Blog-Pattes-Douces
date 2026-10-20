#!/usr/bin/env python3
"""
Convertit des modeles Opus-MT officiels (Helsinki-NLP, licence Apache-2.0) en
ONNX quantifie int8, au format lu par Transformers.js (dtype "q8").

Les modeles directs francais<->arabe n'existent pas en ONNX chez Xenova : on
les convertit nous-memes depuis les modeles PyTorch officiels, une seule fois.
Chaque modele est telecharge a une revision (commit) exacte, enregistree dans
conversion.json. Pour chaque modele, <sortie>/local/opus-mt-<paire>/ contient :

  config.json, generation_config.json, tokenizer_config.json
  tokenizer.json                           (tokenizer rapide, voir ci-dessous)
  onnx/encoder_model_quantized.onnx
  onnx/decoder_model_merged_quantized.onnx
  conversion.json                          (source, revision, licence, quantification)

Etapes : export ONNX par optimum (tache text2text-generation-with-past, qui
produit un decodeur "merged" avec et sans cache), quantification dynamique
int8 des poids (onnxruntime), construction de tokenizer.json, puis VALIDATION
(le script echoue si elle echoue) : le tokenizer est charge avec la librairie
`tokenizers` et compare a SentencePiece, et une traduction est calculee avec
onnxruntime (decodage glouton) pour verifier qu'elle est non vide et dans la
bonne ecriture.

Les depots officiels n'ont pas de tokenizer.json : seulement source.spm,
target.spm et vocab.json (vocabulaire partage). Transformers.js a besoin d'un
tokenizer rapide ; on le construit comme les depots Xenova : un modele Unigram
dont les pieces suivent les identifiants de vocab.json, avec les scores de
source.spm (-100 pour les pieces absentes de source.spm).

Usage : python scripts/convert-opus-mt.py [--output public/models] [--compare-quantization] [paire ...]
Dependances verrouillees : scripts/requirements-torch.txt et
scripts/requirements-translation.txt (Python 3.12+).
"""

from __future__ import annotations

import argparse
import base64
import difflib
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path

# Doit rester aligne sur MODEL_IDS dans src/features/translation/models.ts et
# sur LOCAL_MODELS dans scripts/translation-assets.mjs.
# "revision" : commit exact du depot Helsinki-NLP (reproductibilite, pas de
# changement silencieux du modele en amont).
# "prefix" : jeton de langue cible exige par les modeles multilingues en cible
# (opus-mt-fr-ar sait produire plusieurs varietes d'arabe : >>ara<< = standard).
# "samples" : phrases de validation ; "script" : ecriture attendue en sortie.
PAIRS: dict[str, dict] = {
    "fr-ar": {
        "revision": "5469dc759cd9fd856e45b0a916001efe44d1e700",
        "prefix": ">>ara<<",
        "script": r"[؀-ۿ]",
        "samples": [
            "Bonjour, comment allez-vous ?",
            "Les chats aiment dormir au soleil.",
            "Mon premier jardin de carottes",
            "Bravo pour la persévérance !",
        ],
    },
    "ar-fr": {
        "revision": "e507d7bc850855f060e6bbe4751bb03141b99b7d",
        "prefix": None,
        "script": r"[A-Za-zÀ-ÿ]",
        "samples": [
            "مرحبا بالعالم",
            "القطط تحب النوم في الشمس.",
            "كيف حالك اليوم؟",
            "أحب الذهاب إلى الحديقة مع كلبي.",
        ],
    },
}

# Quantification des poids. QInt8 et QUInt8 (choix de Xenova) ont ete compares
# avec --compare-quantization : similarite de la sortie quantifiee avec celle du
# modele non quantifie sur les 4 phrases de validation. QInt8 : fr-ar 0.961,
# ar-fr 1.000 ; QUInt8 : fr-ar 0.939, ar-fr 0.947. QInt8 reste plus fidele.
QUANT_TYPE = "QInt8"

REQUIRED_FILES = [
    "config.json",
    "generation_config.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "conversion.json",
    "onnx/encoder_model_quantized.onnx",
    "onnx/decoder_model_merged_quantized.onnx",
]

ABSENT_SCORE = -100.0
MAX_STEPS = 64


def is_complete(directory: Path, revision: str) -> bool:
    if not all((directory / name).is_file() and (directory / name).stat().st_size > 0 for name in REQUIRED_FILES):
        return False
    try:
        return json.loads((directory / "conversion.json").read_text(encoding="utf-8"))["revision"] == revision
    except (ValueError, KeyError):
        return False


def download_source(repo: str, revision: str, destination: Path) -> None:
    """Telecharge le modele PyTorch officiel a une revision exacte."""
    from huggingface_hub import snapshot_download

    snapshot_download(
        repo,
        revision=revision,
        local_dir=destination,
        allow_patterns=["*.json", "*.spm", "pytorch_model.bin"],
    )


def export_onnx(source: Path, work: Path) -> None:
    from optimum.exporters.onnx import main_export

    main_export(str(source), output=work, task="text2text-generation-with-past", device="cpu")


def quantize(source: Path, destination: Path, weight_type: str) -> None:
    from onnxruntime.quantization import QuantType, quantize_dynamic

    destination.parent.mkdir(parents=True, exist_ok=True)
    quantize_dynamic(
        model_input=str(source),
        model_output=str(destination),
        weight_type=getattr(QuantType, weight_type),
        # Le decodeur "merged" contient des sous-graphes (If) a quantifier aussi.
        extra_options={"EnableSubgraph": True},
    )


def build_tokenizer(source: Path, prefix: str | None) -> dict:
    """Construit tokenizer.json (Unigram) depuis source.spm et vocab.json."""
    import sentencepiece as spm
    from sentencepiece import sentencepiece_model_pb2

    vocab: dict[str, int] = json.loads((source / "vocab.json").read_text(encoding="utf-8"))
    size = max(vocab.values()) + 1
    processor = spm.SentencePieceProcessor(model_file=str(source / "source.spm"))
    scores = {processor.id_to_piece(i): processor.get_score(i) for i in range(processor.get_piece_size())}

    # Table de normalisation de SentencePiece, reprise telle quelle (comme
    # convert_slow_tokenizer de transformers) : la librairie `tokenizers` l'applique.
    proto = sentencepiece_model_pb2.ModelProto()
    proto.ParseFromString((source / "source.spm").read_bytes())
    charsmap = base64.b64encode(proto.normalizer_spec.precompiled_charsmap).decode("ascii")

    pieces: list[list] = [["<unk>", ABSENT_SCORE] for _ in range(size)]
    for piece, index in vocab.items():
        pieces[index] = [piece, scores.get(piece, ABSENT_SCORE)]
    eos, unk, pad = vocab["</s>"], vocab["<unk>"], vocab["<pad>"]
    # Les jetons speciaux ont un score de 0, comme dans les depots Xenova.
    for token in ("</s>", "<unk>", "<pad>"):
        pieces[vocab[token]][1] = 0.0

    def special(token_id: int, content: str) -> dict:
        return {
            "id": token_id,
            "special": True,
            "content": content,
            "single_word": False,
            "lstrip": False,
            "rstrip": False,
            "normalized": False,
        }

    # Le jeton de langue cible est ajoute avant le texte (modele multilingue en cible).
    template: list[dict] = [{"Sequence": {"id": "A", "type_id": 0}}, {"SpecialToken": {"id": "</s>", "type_id": 0}}]
    special_tokens = {"</s>": {"id": "</s>", "ids": [eos], "tokens": ["</s>"]}}
    if prefix:
        template.insert(0, {"SpecialToken": {"id": prefix, "type_id": 0}})
        special_tokens[prefix] = {"id": prefix, "ids": [vocab[prefix]], "tokens": [prefix]}

    return {
        "version": "1.0",
        "truncation": None,
        "padding": None,
        "added_tokens": sorted([special(eos, "</s>"), special(unk, "<unk>"), special(pad, "<pad>")], key=lambda t: t["id"]),
        "normalizer": {"type": "Precompiled", "precompiled_charsmap": charsmap},
        "pre_tokenizer": {
            "type": "Sequence",
            "pretokenizers": [
                {"type": "WhitespaceSplit"},
                {"type": "Metaspace", "replacement": "▁", "add_prefix_space": True},
            ],
        },
        "post_processor": {
            "type": "TemplateProcessing",
            "single": template,
            "pair": template + template,
            "special_tokens": special_tokens,
        },
        "decoder": {"type": "Metaspace", "replacement": "▁", "add_prefix_space": True},
        "model": {"type": "Unigram", "unk_id": unk, "vocab": pieces},
    }


class ValidationError(Exception):
    pass


def check(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def validate_tokenizer(directory: Path, source: Path, prefix: str | None, samples: list[str]) -> None:
    """Charge tokenizer.json avec `tokenizers` et le compare a SentencePiece."""
    import sentencepiece as spm
    from tokenizers import Tokenizer

    tokenizer = Tokenizer.from_file(str(directory / "tokenizer.json"))
    vocab = json.loads((source / "vocab.json").read_text(encoding="utf-8"))
    processor = spm.SentencePieceProcessor(model_file=str(source / "source.spm"))
    prefix_id = vocab[prefix] if prefix else None

    for text in samples:
        ids = tokenizer.encode(text).ids
        check(ids[-1] == vocab["</s>"], f"le tokenizer n'ajoute pas </s> a {text!r}")
        if prefix_id is not None:
            check(ids[0] == prefix_id, f"le tokenizer n'ajoute pas {prefix} au debut de {text!r}")
            ids = ids[1:]
        expected = [vocab.get(piece, vocab["<unk>"]) for piece in processor.encode(text, out_type=str)] + [vocab["</s>"]]
        check(ids == expected, f"tokenizer.json differe de SentencePiece pour {text!r} : {ids} != {expected}")

    first = tokenizer.encode(samples[0]).ids
    if prefix_id is not None:
        check(first[0] == prefix_id, f"{prefix} absent au debut de la sequence encodee")
    check(first[-1] == 0, "la sequence encodee ne se termine pas par </s> (id 0)")


class Translator:
    """Decodage glouton avec onnxruntime (encodeur + decodeur "merged", sans cache)."""

    def __init__(self, directory: Path, encoder: Path, decoder: Path, prefix: str | None) -> None:
        import numpy as np
        import onnxruntime as ort
        from tokenizers import Tokenizer

        self.np = np
        options = ort.SessionOptions()
        options.log_severity_level = 3
        self.encoder = ort.InferenceSession(str(encoder), options, providers=["CPUExecutionProvider"])
        self.decoder = ort.InferenceSession(str(decoder), options, providers=["CPUExecutionProvider"])
        self.tokenizer = Tokenizer.from_file(str(directory / "tokenizer.json"))
        generation = json.loads((directory / "generation_config.json").read_text(encoding="utf-8"))
        self.start = generation["decoder_start_token_id"]
        self.pad = generation["pad_token_id"]
        self.eos = generation["eos_token_id"]

    def translate(self, text: str) -> str:
        np = self.np
        ids = np.array([self.tokenizer.encode(text).ids], dtype=np.int64)
        mask = np.ones_like(ids)
        hidden = self.encoder.run(None, {"input_ids": ids, "attention_mask": mask})[0]

        output = [self.start]
        for _ in range(MAX_STEPS):
            feeds = {}
            for spec in self.decoder.get_inputs():
                if spec.name == "input_ids":
                    feeds[spec.name] = np.array([output], dtype=np.int64)
                elif spec.name == "encoder_hidden_states":
                    feeds[spec.name] = hidden
                elif spec.name == "encoder_attention_mask":
                    feeds[spec.name] = mask
                elif spec.name == "use_cache_branch":
                    feeds[spec.name] = np.array([False])
                else:  # past_key_values.* : vides, car on recalcule tout a chaque pas
                    shape = [1 if i == 0 else (0 if isinstance(d, str) else d) for i, d in enumerate(spec.shape)]
                    feeds[spec.name] = np.zeros(shape, dtype=np.float32)
            logits = self.decoder.run(["logits"], feeds)[0][0, -1].copy()
            logits[self.pad] = -np.inf
            token = int(logits.argmax())
            if token == self.eos:
                break
            output.append(token)
        return self.tokenizer.decode(output[1:], skip_special_tokens=True).strip()


def validate_translation(translator: Translator, pair: str, options: dict) -> list[str]:
    """Traduit les phrases d'exemple et verifie que la sortie est sensee."""
    outputs = []
    for text in options["samples"]:
        translated = translator.translate(text)
        letters = re.findall(options["script"], translated)
        check(bool(translated.strip()), f"{pair} : traduction vide pour {text!r}")
        check(
            len(letters) >= 0.6 * len(re.findall(r"\w", translated)),
            f"{pair} : sortie dans la mauvaise ecriture pour {text!r} : {translated!r}",
        )
        print(f"  {text}  =>  {translated}", flush=True)
        outputs.append(translated)
    return outputs


def similarity(a: list[str], b: list[str]) -> float:
    return sum(difflib.SequenceMatcher(None, x, y).ratio() for x, y in zip(a, b)) / len(a)


def convert(pair: str, options: dict, output: Path, compare: bool) -> None:
    destination = output / "local" / f"opus-mt-{pair}"
    revision = options["revision"]
    if is_complete(destination, revision):
        print(f"Deja converti : {destination}")
        return

    repo = f"Helsinki-NLP/opus-mt-{pair}"
    print(f"Conversion de {repo}@{revision[:8]} (plusieurs minutes la premiere fois)...", flush=True)
    with tempfile.TemporaryDirectory(prefix=f"opus-mt-{pair}-") as temp:
        work = Path(temp)
        source = work / "source"
        download_source(repo, revision, source)
        export_onnx(source, work / "onnx")
        exported = work / "onnx"

        staging = work / "out"
        tokenizer = build_tokenizer(source, options["prefix"])
        staging.mkdir()
        (staging / "tokenizer.json").write_text(json.dumps(tokenizer, ensure_ascii=False), encoding="utf-8")
        for name in ("config.json", "generation_config.json", "tokenizer_config.json"):
            shutil.copyfile(exported / name, staging / name)
        validate_tokenizer(staging, source, options["prefix"], options["samples"])

        encoder, decoder = "encoder_model", "decoder_model_merged"
        if compare:
            reference = Translator(staging, exported / f"{encoder}.onnx", exported / f"{decoder}.onnx", options["prefix"])
            print("Reference (non quantifie) :")
            expected = validate_translation(reference, pair, options)
            for weight_type in ("QInt8", "QUInt8"):
                quantize(exported / f"{encoder}.onnx", work / weight_type / f"{encoder}.onnx", weight_type)
                quantize(exported / f"{decoder}.onnx", work / weight_type / f"{decoder}.onnx", weight_type)
                candidate = Translator(
                    staging, work / weight_type / f"{encoder}.onnx", work / weight_type / f"{decoder}.onnx", options["prefix"]
                )
                print(f"{weight_type} :")
                score = similarity(expected, validate_translation(candidate, pair, options))
                print(f"-> similarite avec la reference ({pair}, {weight_type}) : {score:.3f}", flush=True)
            return

        onnx_dir = staging / "onnx"
        quantize(exported / f"{encoder}.onnx", onnx_dir / f"{encoder}_quantized.onnx", QUANT_TYPE)
        quantize(exported / f"{decoder}.onnx", onnx_dir / f"{decoder}_quantized.onnx", QUANT_TYPE)

        print("Validation de la traduction avec les modeles quantifies :")
        translator = Translator(
            staging, onnx_dir / f"{encoder}_quantized.onnx", onnx_dir / f"{decoder}_quantized.onnx", options["prefix"]
        )
        validate_translation(translator, pair, options)

        (staging / "conversion.json").write_text(
            json.dumps(
                {
                    "source": repo,
                    "revision": revision,
                    "license": "apache-2.0",
                    "quantization": QUANT_TYPE,
                    "note": "Converti en ONNX par scripts/convert-opus-mt.py ; modele original (c) Helsinki-NLP, Apache-2.0.",
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

        # Deplacement en dernier : un dossier present est toujours complet et valide.
        if destination.exists():
            shutil.rmtree(destination)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(staging), str(destination))
    print(f"Pret : {destination}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("pairs", nargs="*", help=f"paires a convertir parmi {', '.join(PAIRS)} (toutes par defaut)")
    parser.add_argument("--output", default="public/models", type=Path, help="dossier des modeles (defaut : public/models)")
    parser.add_argument("--compare-quantization", action="store_true", help="compare QInt8 et QUInt8, n'ecrit rien")
    args = parser.parse_args()
    unknown = [pair for pair in args.pairs if pair not in PAIRS]
    if unknown:
        parser.error(f"paire inconnue : {', '.join(unknown)}")
    try:
        for pair in args.pairs or PAIRS:
            convert(pair, PAIRS[pair], args.output, args.compare_quantization)
    except ValidationError as error:
        print(f"ERREUR DE VALIDATION : {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
