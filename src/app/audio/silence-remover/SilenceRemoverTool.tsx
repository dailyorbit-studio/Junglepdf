"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup, ChoiceRow } from "@/components/FileToolRunner";
import {
  removeSilence,
  SILENCE_DEFAULTS,
  type SilenceOptions,
  type AudioEffectResult,
} from "@/lib/audio-effects";

const MODES: { value: SilenceOptions["mode"]; label: string }[] = [
  { value: "all", label: "Everywhere" },
  { value: "edges", label: "Start and end only" },
];

const THRESHOLDS = [
  { value: -50, label: "-50 dB (very quiet)" },
  { value: -40, label: "-40 dB" },
  { value: -35, label: "-35 dB" },
  { value: -30, label: "-30 dB" },
  { value: -20, label: "-20 dB (aggressive)" },
];

export default function SilenceRemoverTool() {
  const [options, setOptions] = useState<SilenceOptions>(SILENCE_DEFAULTS);

  return (
    <FileToolRunner<AudioEffectResult & { notice?: string | null }>
      accept=".mp3,.wav,.ogg,.m4a,.flac,.aac"
      maxFileSizeMB={300}
      dropLabel="Drop an audio file here, or click to browse"
      dropSublabel="MP3, WAV, OGG, M4A or FLAC — up to 300MB"
      run={(file, onProgress) => removeSilence(file, options, onProgress)}
      actionLabel="Remove silence"
      busyLabel="Removing silence…"
      resultTitle="Silence removed"
      resultDetail={(result) =>
        `${(result.blob.size / (1024 * 1024)).toFixed(1)}MB — was ${(
          result.originalSize /
          (1024 * 1024)
        ).toFixed(1)}MB`
      }
      downloadLabel="Download trimmed audio"
      againLabel="Do another"
      hint="Start with the defaults. If it cuts into speech, lower the threshold; if pauses survive, raise it or shorten the minimum length."
      options={(disabled) => (
        <div className="space-y-4">
          <OptionGroup label="Trim silence">
            <ChoiceRow
              value={options.mode}
              options={MODES}
              onChange={(mode) => setOptions((o) => ({ ...o, mode }))}
              disabled={disabled}
            />
          </OptionGroup>

          <OptionGroup
            label="Anything quieter than this counts as silence"
            hint="Room tone on a decent recording sits around -50dB; a noisy room can be -30dB."
          >
            <ChoiceRow
              value={options.thresholdDb}
              options={THRESHOLDS}
              onChange={(thresholdDb) => setOptions((o) => ({ ...o, thresholdDb }))}
              disabled={disabled}
            />
          </OptionGroup>

          <div>
            <label
              htmlFor="silence-duration"
              className="block text-xs font-medium text-ink-secondary mb-1.5"
            >
              Minimum length to cut — {options.minDurationSeconds.toFixed(1)}s
            </label>
            <input
              id="silence-duration"
              type="range"
              min={1}
              max={30}
              value={Math.round(options.minDurationSeconds * 10)}
              disabled={disabled}
              onChange={(e) =>
                setOptions((o) => ({ ...o, minDurationSeconds: Number(e.target.value) / 10 }))
              }
              className="w-full accent-accent"
            />
            <p className="text-xs text-ink-muted mt-1">
              Shorter than this and the gap is left alone — which is what keeps the
              natural pauses between sentences.
            </p>
          </div>
        </div>
      )}
    />
  );
}
