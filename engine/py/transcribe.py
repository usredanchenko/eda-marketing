"""Local word-level transcription with faster-whisper. No downloads: local_files_only=True.

Usage: python transcribe.py <media> <out.json> <model_dir> [model=small] [language=en]
The result is a DRAFT: never edited by hand. Corrections go to transcript/corrected.json.
"""
import json
import sys

from faster_whisper import WhisperModel


def main() -> None:
    src, out, model_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    model_name = sys.argv[4] if len(sys.argv) > 4 else "small"
    language = sys.argv[5] if len(sys.argv) > 5 else "en"
    model = WhisperModel(
        model_name,
        device="cpu",
        compute_type="int8",
        download_root=model_dir,
        local_files_only=True,
    )
    segments, info = model.transcribe(
        src,
        language=language,
        beam_size=5,
        word_timestamps=True,
        condition_on_previous_text=False,
    )
    words = []
    for seg in segments:
        for w in seg.words or []:
            words.append(
                {
                    "text": w.word.strip(),
                    "startMs": round(w.start * 1000),
                    "endMs": round(w.end * 1000),
                    "confidence": round(w.probability, 3),
                }
            )
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(
            {
                "engine": "faster-whisper",
                "model": model_name,
                "language": info.language,
                "source": src,
                "verifiedByListening": False,
                "note": "Automatic recognition is a draft, not checked by listening. Do not edit: put corrections in corrected.json.",
                "words": words,
            },
            fh,
            ensure_ascii=False,
            indent=1,
        )


if __name__ == "__main__":
    main()
