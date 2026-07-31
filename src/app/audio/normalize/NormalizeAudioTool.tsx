"use client";

import { useState } from "react";
import FileToolRunner from "@/components/FileToolRunner";
import {
  normalizeAudio,
  NORMALIZE_PRESETS,
  type NormalizeMode,
  type AudioEffectResult,
} from "@/lib/audio-effects";

const MODES = Object.keys(NORMALIZE_PRESETS) as NormalizeMode[];

export default function NormalizeAudioTool() {
  const [mode, setMode] = useState<NormalizeMode>("streaming");

  return (
    <FileToolRunner<AudioEffectResult & { notice?: string | null }>
      accept=".mp3,.wav,.ogg,.m4a,.flac,.aac"
      maxFileSizeMB={300}
      dropLabel="Drop an audio file here, or click to browse"
      dropSublabel="MP3, WAV, OGG, M4A or FLAC — up to 300MB"
      run={(file, onProgress) => normalizeAudio(file, mode, onProgress)}
      actionLabel="Normalize audio"
      busyLabel="Normalising…"
      resultTitle="Loudness normalised"
      resultDetail={(result) =>
        `${NORMALIZE_PRESETS[mode].label} — ${(result.blob.size / (1024 * 1024)).toFixed(1)}MB`
      }
      downloadLabel="Download normalised audio"
      againLabel="Do another"
      hint="Normalising applies one gain across the whole file. It is not compression — the loud and quiet parts keep their relationship to each other."
      options={(disabled) => (
        <fieldset className="space-y-2" disabled={disabled}>
          <legend className="text-xs font-medium text-ink-secondary mb-1.5">Target</legend>
          {MODES.map((value) => {
            const preset = NORMALIZE_PRESETS[value];
            return (
              <label
                key={value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  mode === value
                    ? "border-accent bg-accent-subtle"
                    : "border-border hover:bg-surface-raised"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="normalize-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                  className="mt-0.5 accent-accent"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{preset.label}</span>
                  <span className="block text-xs text-ink-muted mt-0.5">{preset.detail}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}
    />
  );
}
