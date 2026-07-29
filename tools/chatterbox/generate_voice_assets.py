from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any


SCRIPT_DIRECTORY = Path(__file__).resolve().parent
DEFAULT_MANIFEST_PATH = SCRIPT_DIRECTORY / "voice_manifest.json"
DEFAULT_OUTPUT_DIRECTORY = SCRIPT_DIRECTORY / "output"
LOCAL_CACHE_DIRECTORY = SCRIPT_DIRECTORY / ".cache"
MODEL_REPOSITORIES = {
    "original": "ResembleAI/chatterbox",
    "nano": "ResembleAI/chatterbox-nano",
}

os.environ.setdefault(
    "HF_HOME",
    str(LOCAL_CACHE_DIRECTORY / "huggingface"),
)
os.environ.setdefault(
    "TORCH_HOME",
    str(LOCAL_CACHE_DIRECTORY / "torch"),
)


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate reproducible character voice assets with Chatterbox.",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=DEFAULT_MANIFEST_PATH,
        help="Path to the voice manifest JSON.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIRECTORY,
        help="Directory where generated WAV files are written.",
    )
    parser.add_argument(
        "--reference",
        type=Path,
        help="Optional original or authorized voice reference clip.",
    )
    parser.add_argument(
        "--only",
        nargs="*",
        default=[],
        help="Generate only the listed manifest line IDs.",
    )
    parser.add_argument(
        "--model",
        choices=tuple(MODEL_REPOSITORIES),
        default="nano",
        help="Chatterbox model variant. Nano is designed for CPU generation.",
    )
    parser.add_argument(
        "--device",
        choices=("auto", "cpu", "cuda", "mps"),
        default="auto",
        help="Inference device. Auto prefers CUDA, then MPS, then CPU.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace existing WAV files.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and print the generation plan without loading Chatterbox.",
    )
    return parser.parse_args()


def load_manifest(manifest_path: Path) -> dict[str, Any]:
    with manifest_path.open("r", encoding="utf-8") as manifest_file:
        manifest = json.load(manifest_file)

    lines = manifest.get("lines")
    if not isinstance(lines, list) or not lines:
        raise ValueError("The manifest must contain a non-empty 'lines' array.")

    required_fields = {
        "id",
        "reactionId",
        "variationIndex",
        "text",
        "file",
        "profile",
        "exaggeration",
        "cfgWeight",
        "temperature",
        "seed",
    }
    seen_ids: set[str] = set()
    seen_files: set[str] = set()

    for line in lines:
        missing_fields = required_fields.difference(line)
        if missing_fields:
            raise ValueError(
                f"Line {line.get('id', '<unknown>')} is missing: "
                f"{', '.join(sorted(missing_fields))}",
            )

        if line["id"] in seen_ids:
            raise ValueError(f"Duplicate line ID: {line['id']}")
        if line["file"] in seen_files:
            raise ValueError(f"Duplicate output file: {line['file']}")
        if not line["file"].endswith(".wav"):
            raise ValueError(f"Output must be WAV: {line['file']}")
        if not 0 <= line["exaggeration"] <= 2:
            raise ValueError(f"Invalid exaggeration for {line['id']}")
        if not 0 <= line["cfgWeight"] <= 1:
            raise ValueError(f"Invalid cfgWeight for {line['id']}")
        if not 0 < line["temperature"] <= 2:
            raise ValueError(f"Invalid temperature for {line['id']}")

        seen_ids.add(line["id"])
        seen_files.add(line["file"])

    return manifest


def select_lines(
    manifest: dict[str, Any],
    selected_ids: list[str],
) -> list[dict[str, Any]]:
    lines = manifest["lines"]
    if not selected_ids:
        return [line for line in lines if line.get("includeInGame", True)]

    selected_id_set = set(selected_ids)
    known_ids = {line["id"] for line in lines}
    unknown_ids = selected_id_set.difference(known_ids)
    if unknown_ids:
        raise ValueError(
            f"Unknown line IDs: {', '.join(sorted(unknown_ids))}",
        )

    return [line for line in lines if line["id"] in selected_id_set]


def resolve_device(requested_device: str, torch_module: Any) -> str:
    if requested_device != "auto":
        return requested_device
    if torch_module.cuda.is_available():
        return "cuda"
    if torch_module.backends.mps.is_available():
        return "mps"
    return "cpu"


def sha256_for_file(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as input_file:
        for chunk in iter(lambda: input_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def print_plan(
    lines: list[dict[str, Any]],
    output_directory: Path,
    reference_path: Path | None,
    model_variant: str,
) -> None:
    voice_source = reference_path if reference_path else "Chatterbox built-in voice"
    print(f"Voice source: {voice_source}")
    print(f"Model: {MODEL_REPOSITORIES[model_variant]}")
    print(f"Output directory: {output_directory.resolve()}")
    print(f"Lines selected: {len(lines)}")

    for line in lines:
        if model_variant == "original":
            controls = (
                f"exaggeration={line['exaggeration']:.2f} | "
                f"cfg={line['cfgWeight']:.2f}"
            )
        else:
            controls = f"temperature={line['temperature']:.2f}"

        print(
            f"- {line['id']}: {line['profile']} | {controls} | "
            f"{line.get('renderText', line['text'])}",
        )


def generate_assets(arguments: argparse.Namespace) -> None:
    manifest_path = arguments.manifest.resolve()
    output_directory = arguments.output_dir.resolve()
    reference_path = arguments.reference.resolve() if arguments.reference else None
    manifest = load_manifest(manifest_path)
    lines = select_lines(manifest, arguments.only)

    if reference_path and not reference_path.is_file():
        raise FileNotFoundError(f"Voice reference not found: {reference_path}")

    print_plan(
        lines,
        output_directory,
        reference_path,
        arguments.model,
    )
    if arguments.dry_run:
        return

    import soundfile as sf
    import torch
    device = resolve_device(arguments.device, torch)
    print(f"Inference device: {device}")
    if arguments.model == "nano":
        from chatterbox.tts_turbo import ChatterboxTurboTTS

        model = ChatterboxTurboTTS.from_pretrained(
            device=device,
            nano=True,
        )
    else:
        from chatterbox.tts import ChatterboxTTS

        model = ChatterboxTTS.from_pretrained(device=device)

    if reference_path:
        if arguments.model == "nano":
            model.prepare_conditionals(str(reference_path))
        else:
            model.prepare_conditionals(
                str(reference_path),
                exaggeration=lines[0]["exaggeration"],
            )

    output_directory.mkdir(parents=True, exist_ok=True)
    generated_lines: list[dict[str, Any]] = []

    for line in lines:
        output_path = output_directory / line["file"]
        if output_path.exists() and not arguments.overwrite:
            print(f"Skipping existing file: {output_path.name}")
            continue

        print(f"Generating {line['id']} ({line['profile']})...")
        torch.manual_seed(line["seed"])
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(line["seed"])

        rendered_text = line.get("renderText", line["text"])
        if arguments.model == "nano":
            waveform = model.generate(
                rendered_text,
                temperature=line["temperature"],
            )
        else:
            waveform = model.generate(
                rendered_text,
                exaggeration=line["exaggeration"],
                cfg_weight=line["cfgWeight"],
                temperature=line["temperature"],
            )
        audio = waveform.squeeze(0).detach().cpu().numpy()
        sf.write(output_path, audio, model.sr, subtype="PCM_16")

        generated_lines.append(
            {
                **line,
                "sampleRate": model.sr,
                "durationSeconds": round(len(audio) / model.sr, 3),
                "sha256": sha256_for_file(output_path),
            },
        )
        print(f"Saved {output_path.name}")

    report = {
        "model": MODEL_REPOSITORIES[arguments.model],
        "device": device,
        "voiceDirection": manifest["voiceDirection"],
        "reference": (
            {
                "file": reference_path.name,
                "sha256": sha256_for_file(reference_path),
            }
            if reference_path
            else {"source": "built-in"}
        ),
        "generatedLines": generated_lines,
    }
    report_path = output_directory / "generation-report.json"
    with report_path.open("w", encoding="utf-8") as report_file:
        json.dump(report, report_file, indent=2, ensure_ascii=False)
        report_file.write("\n")
    print(f"Generation report: {report_path}")


if __name__ == "__main__":
    generate_assets(parse_arguments())
