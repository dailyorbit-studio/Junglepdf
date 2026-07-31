"use client";

import { useRef, useState } from "react";

interface VideoRangePickerProps {
  /** Object URL for the source video. */
  src: string;
  duration: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
  disabled?: boolean;
}

function formatTime(seconds: number): string {
  const total = Math.max(0, seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
}

/**
 * A video preview with two range sliders bounding the selection.
 *
 * Shared by the trimmer and the GIF maker, which need identical interaction.
 * Scrubbing a handle seeks the preview to that handle's position, so the
 * selection is judged against frames rather than against numbers.
 */
export default function VideoRangePicker({
  src,
  duration,
  start,
  end,
  onChange,
  disabled = false,
}: VideoRangePickerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrubbing, setScrubbing] = useState<"start" | "end" | null>(null);

  const seek = (time: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, Math.min(time, duration));
  };

  const setStart = (value: number) => {
    // Keep at least a tenth of a second between the handles so they cannot
    // cross and produce a negative-length selection.
    const next = Math.min(value, end - 0.1);
    onChange(Math.max(0, next), end);
    seek(next);
  };

  const setEnd = (value: number) => {
    const next = Math.max(value, start + 0.1);
    onChange(start, Math.min(duration, next));
    seek(next);
  };

  const selectionLeft = (start / duration) * 100;
  const selectionWidth = ((end - start) / duration) * 100;

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden bg-black border border-border-subtle">
        <video
          ref={videoRef}
          src={src}
          controls
          preload="metadata"
          className="w-full max-h-80 block"
        />
      </div>

      <div>
        {/* Track showing the selected span against the whole timeline. */}
        <div className="relative h-2 rounded-full bg-surface-raised mb-3">
          <div
            className="absolute h-full rounded-full bg-accent/40"
            style={{ left: `${selectionLeft}%`, width: `${selectionWidth}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="range-start" className="block text-xs font-medium text-ink-secondary mb-1">
              Start — {formatTime(start)}
            </label>
            <input
              id="range-start"
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={start}
              disabled={disabled}
              onChange={(e) => setStart(parseFloat(e.target.value))}
              onPointerDown={() => setScrubbing("start")}
              onPointerUp={() => setScrubbing(null)}
              className="w-full accent-accent disabled:opacity-40"
            />
          </div>
          <div>
            <label htmlFor="range-end" className="block text-xs font-medium text-ink-secondary mb-1">
              End — {formatTime(end)}
            </label>
            <input
              id="range-end"
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={end}
              disabled={disabled}
              onChange={(e) => setEnd(parseFloat(e.target.value))}
              onPointerDown={() => setScrubbing("end")}
              onPointerUp={() => setScrubbing(null)}
              className="w-full accent-accent disabled:opacity-40"
            />
          </div>
        </div>

        <p className="text-xs text-ink-muted mt-2">
          Selection: {formatTime(end - start)}
          {scrubbing && <span className="text-accent"> · preview follows the {scrubbing} handle</span>}
        </p>
      </div>
    </div>
  );
}
