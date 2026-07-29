# Chatterbox voice generation

This folder contains the reproducible offline pipeline for the character voice.
The generated WAV files are later consumed by the React application; the model
does not run in the browser or during gameplay.

## Why Chatterbox Nano

The original 500M English model exposes `exaggeration` and `cfg_weight`, but its
current checkpoints exceed 3 GB and could not be loaded within this machine's
CPU memory budget. Chatterbox Nano is the official 110M CPU-oriented variant.
It keeps voice cloning and paralinguistic tags such as `[sigh]`, `[chuckle]`
and `[laugh]`.

The exact official repository commit is pinned in `requirements.txt` because
the PyPI wheel with the same package version did not yet expose Nano.

## Files

- `voice_manifest.json`: dialogue, acting profile, sampling values and seed;
- `generate_voice_assets.py`: validates the manifest and generates WAV files;
- `reference/`: local authorized reference recording, ignored by Git;
- `output/`: generated auditions and final files, ignored by Git.

## Commands

Create the isolated environment and install the pinned dependencies:

```powershell
python -m venv tools/chatterbox/.venv
tools/chatterbox/.venv/Scripts/python.exe -m pip install -r tools/chatterbox/requirements.txt
```

Inspect a generation plan without loading the model:

```powershell
tools/chatterbox/.venv/Scripts/python.exe tools/chatterbox/generate_voice_assets.py --dry-run
```

Generate selected lines with the built-in Nano voice:

```powershell
tools/chatterbox/.venv/Scripts/python.exe tools/chatterbox/generate_voice_assets.py --model nano --only swap-rejected-0 swap-rejected-1 swap-rejected-2
```

Generate all lines with an original or explicitly authorized reference:

```powershell
tools/chatterbox/.venv/Scripts/python.exe tools/chatterbox/generate_voice_assets.py --model nano --reference tools/chatterbox/reference/character-voice.wav
```

Generate the approved built-in voice directly into the application:

```powershell
tools/chatterbox/.venv/Scripts/python.exe tools/chatterbox/generate_voice_assets.py --model nano --output-dir app/src/audio/voice
```

Lines marked with `"includeInGame": false` are excluded from a full generation
run. They remain in the manifest as auditionable dialogue history and can still
be rendered explicitly with `--only`. The drag-start lines use this policy so
their speech bubbles stay visible without repetitive voice playback.

The reference must be longer than five seconds. Eight to twelve seconds of
clean English speech is recommended. Use an adult performer doing a youthful
character voice; do not clone an actor or another identifiable person without
permission.
