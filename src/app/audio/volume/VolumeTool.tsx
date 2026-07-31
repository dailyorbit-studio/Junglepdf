"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  decodeForVolume,
  applyVolume,
  formatDecibels,
  headroomGain,
  type DecodedAudio,
  type VolumeResult,
} from "@/lib/audio-volume";
import { formatDuration } from "@/lib/media-info";
import { downloadBlob } from "@/lib/download";

export default function VolumeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<DecodedAudio | null>(null);

  const [gain, setGain] = useState(1);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [normalize, setNormalize] = useState(false);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VolumeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0];
    setError(null);
    setResult(null);
    setDecoded(null);
    setGain(1);
    setFadeIn(0);
    setFadeOut(0);
    setNormalize(false);
    setLoading(true);

    try {
      const info = await decodeForVolume(selected, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setDecoded(info);
      setFile(selected);
    } catch (err) {
      // file stays null, so this renders outside the {file && ...} branch.
      setError(err instanceof Error ? err.message : "This file couldn't be read.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApply = useCallback(async () => {
    if (!file || !decoded) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await applyVolume(
        decoded.buffer,
        { gain, fadeInSeconds: fadeIn, fadeOutSeconds: fadeOut, normalize },
        file.name,
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while processing.");
    } finally {
      setProcessing(false);
    }
  }, [file, decoded, gain, fadeIn, fadeOut, normalize]);

  const reset = () => {
    setFile(null);
    setDecoded(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const maxGain = decoded ? headroomGain(decoded.peak) : 1;
  const willClip = decoded !== null && !normalize && decoded.peak * gain > 1;
  const maxFade = decoded ? Math.floor(decoded.duration / 2) : 0;

  return (
    <>
      {!file && !loading && (
        <FileDropZone
          accept=".mp3,.wav,.ogg,.m4a,.flac,.aac"
          maxFileSizeMB={200}
          onFiles={handleFiles}
          label="Drop an audio file here, or click to browse"
          sublabel="MP3, WAV, OGG, M4A, FLAC — up to 200MB"
        />
      )}

      {loading && (
        <div className="py-4">
          <ProgressBar progress={progress} label={progressLabel} />
        </div>
      )}

      {!file && !loading && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && decoded && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {formatDuration(decoded.duration)} · {(decoded.sampleRate / 1000).toFixed(1)}kHz ·
              peaks at {Math.round(decoded.peak * 100)}% of full scale
            </p>
          </div>

          <div>
            <label htmlFor="volume-gain" className="block text-xs font-medium text-ink-secondary mb-1">
              Volume ({formatDecibels(gain)})
            </label>
            <input
              id="volume-gain"
              type="range"
              min={0}
              max={4}
              step={0.05}
              value={gain}
              onChange={(e) => setGain(parseFloat(e.target.value))}
              disabled={normalize}
              className="w-full accent-accent mt-1 disabled:opacity-40"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-ink-muted">
                {gain === 1 ? "Unchanged" : `${gain.toFixed(2)}×`}
              </span>
              <button
                onClick={() => setGain(1)}
                disabled={gain === 1 || normalize}
                className="text-xs text-accent hover:text-accent-hover disabled:opacity-30 font-medium transition-colors"
              >
                Reset to 0 dB
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={normalize}
              onChange={(e) => setNormalize(e.target.checked)}
              className="accent-accent mt-0.5"
            />
            <span className="text-xs text-ink-secondary">
              Normalise instead — turn the track up as far as it goes without clipping
              <span className="block text-ink-muted mt-0.5">
                For this file that is {formatDecibels(maxGain)}.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fade-in" className="block text-xs font-medium text-ink-secondary mb-1">
                Fade in ({fadeIn}s)
              </label>
              <input
                id="fade-in"
                type="range"
                min={0}
                max={Math.max(1, Math.min(15, maxFade))}
                step={0.5}
                value={fadeIn}
                onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                className="w-full accent-accent mt-2"
              />
            </div>
            <div>
              <label htmlFor="fade-out" className="block text-xs font-medium text-ink-secondary mb-1">
                Fade out ({fadeOut}s)
              </label>
              <input
                id="fade-out"
                type="range"
                min={0}
                max={Math.max(1, Math.min(15, maxFade))}
                step={0.5}
                value={fadeOut}
                onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                className="w-full accent-accent mt-2"
              />
            </div>
          </div>

          {willClip && (
            <NoticeMessage>
              At {formatDecibels(gain)} the loudest parts of this track go past full scale and will
              be clipped, which sounds like distortion. Stay under {formatDecibels(maxGain)}, or
              turn on normalise to get the maximum safe level automatically.
            </NoticeMessage>
          )}

          <p className="text-xs text-ink-muted">
            Output is a lossless WAV at {(decoded.sampleRate / 1000).toFixed(1)}kHz. Decoding
            resamples to your device&apos;s audio rate, so this may differ from the source.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing || (gain === 1 && fadeIn === 0 && fadeOut === 0 && !normalize)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Processing…" : "Apply and download"}
            </button>
            <button
              onClick={reset}
              disabled={processing}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="Audio adjusted"
            detail={`${formatDuration(result.duration)} · peaks at ${Math.round(result.peakAfter * 100)}% · ${(result.blob.size / (1024 * 1024)).toFixed(1)} MB`}
          />
          {result.clipped && (
            <NoticeMessage>
              Some samples were clipped at full scale. The loudest passages may sound distorted —
              lower the gain, or use normalise, and try again.
            </NoticeMessage>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Adjust another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
