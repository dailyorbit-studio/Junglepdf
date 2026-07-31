"use client";

import { useState } from "react";
import FileToolRunner from "@/components/FileToolRunner";
import {
  shiftPitch,
  describePitchLimits,
  MIN_SEMITONES,
  MAX_SEMITONES,
  type PitchResult,
} from "@/lib/audio-effects";

/** Musical name for a shift, so the number means something to a musician. */
function intervalName(semitones: number): string {
  const names: Record<number, string> = {
    1: "minor 2nd",
    2: "major 2nd",
    3: "minor 3rd",
    4: "major 3rd",
    5: "perfect 4th",
    6: "tritone",
    7: "perfect 5th",
    8: "minor 6th",
    9: "major 6th",
    10: "minor 7th",
    11: "major 7th",
    12: "octave",
  };
  const name = names[Math.abs(semitones)];
  if (!name) return "";
  return `${semitones > 0 ? "up" : "down"} a ${name}`;
}

export default function PitchShifterTool() {
  const [semitones, setSemitones] = useState(2);

  return (
    <FileToolRunner<PitchResult & { notice?: string | null }>
      accept=".mp3,.wav,.ogg,.m4a,.flac,.aac"
      maxFileSizeMB={300}
      dropLabel="Drop an audio file here, or click to browse"
      dropSublabel="MP3, WAV, OGG, M4A or FLAC — up to 300MB"
      canRun={semitones !== 0}
      run={(file, onProgress) => shiftPitch(file, semitones, onProgress)}
      actionLabel="Shift pitch"
      busyLabel="Retuning…"
      resultTitle="Pitch shifted"
      resultDetail={(result) =>
        `${result.semitones > 0 ? "+" : ""}${result.semitones} semitones — same length as the original`
      }
      downloadLabel="Download retuned audio"
      againLabel="Do another"
      hint={
        <ul className="space-y-1">
          {describePitchLimits().map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      }
      options={(disabled) => (
        <div>
          <label htmlFor="pitch-amount" className="block text-xs font-medium text-ink-secondary mb-1.5">
            Shift by{" "}
            <span className="text-ink font-semibold">
              {semitones > 0 ? "+" : ""}
              {semitones} semitone{Math.abs(semitones) === 1 ? "" : "s"}
            </span>
            {intervalName(semitones) && (
              <span className="text-ink-muted"> — {intervalName(semitones)}</span>
            )}
          </label>
          <input
            id="pitch-amount"
            type="range"
            min={MIN_SEMITONES}
            max={MAX_SEMITONES}
            step={1}
            value={semitones}
            disabled={disabled}
            onChange={(e) => setSemitones(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-ink-muted mt-1">
            <span>−12 (an octave down)</span>
            <span>0</span>
            <span>+12 (an octave up)</span>
          </div>
          {semitones === 0 && (
            <p className="text-xs text-ink-muted mt-2">
              Zero is the original pitch — move the slider to pick a shift.
            </p>
          )}
        </div>
      )}
    />
  );
}
