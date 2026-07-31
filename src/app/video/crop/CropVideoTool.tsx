"use client";

import { useState, useCallback } from "react";
import FileToolRunner, { OptionGroup, ChoiceRow, NumberField } from "@/components/FileToolRunner";
import { cropVideo, type CropRect, type VideoResult } from "@/lib/video-tools";
import { readMediaInfo } from "@/lib/media-info";

type Preset = "custom" | "1:1" | "4:5" | "9:16" | "16:9";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "custom", label: "Custom" },
  { value: "1:1", label: "1:1 square" },
  { value: "4:5", label: "4:5 portrait" },
  { value: "9:16", label: "9:16 vertical" },
  { value: "16:9", label: "16:9 wide" },
];

const RATIOS: Record<Exclude<Preset, "custom">, number> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "9:16": 9 / 16,
  "16:9": 16 / 9,
};

interface CropResult extends VideoResult {
  notice?: string | null;
}

export default function CropVideoTool() {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [preset, setPreset] = useState<Preset>("custom");
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });

  // The source dimensions are read from a hidden <video> element rather than
  // by probing with FFmpeg: reading a header should not cost 32MB of WASM.
  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      setDimensions(null);
      setRect({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }
    try {
      const info = await readMediaInfo(file, "video");
      setDimensions({ width: info.width, height: info.height });
      setRect({ x: 0, y: 0, width: info.width, height: info.height });
      setPreset("custom");
    } catch {
      setDimensions(null);
    }
  }, []);

  const applyPreset = useCallback(
    (next: Preset) => {
      setPreset(next);
      if (next === "custom" || !dimensions) return;

      // Largest centred rectangle of the target ratio that still fits.
      const ratio = RATIOS[next];
      let width = dimensions.width;
      let height = Math.round(width / ratio);
      if (height > dimensions.height) {
        height = dimensions.height;
        width = Math.round(height * ratio);
      }
      setRect({
        x: Math.round((dimensions.width - width) / 2),
        y: Math.round((dimensions.height - height) / 2),
        width,
        height,
      });
    },
    [dimensions]
  );

  const inBounds =
    !dimensions ||
    (rect.width >= 2 &&
      rect.height >= 2 &&
      rect.x >= 0 &&
      rect.y >= 0 &&
      rect.x + rect.width <= dimensions.width &&
      rect.y + rect.height <= dimensions.height);

  return (
    <FileToolRunner<CropResult>
      accept=".mp4,.mkv,.avi,.webm,.mov"
      maxFileSizeMB={500}
      dropLabel="Drop a video here, or click to browse"
      dropSublabel="MP4, MKV, AVI, WebM or MOV — up to 500MB"
      onFileChange={handleFile}
      canRun={inBounds && rect.width > 0}
      run={(file, onProgress) => cropVideo(file, rect, onProgress)}
      actionLabel="Crop video"
      busyLabel="Cropping…"
      resultTitle="Video cropped"
      resultDetail={(result) =>
        `${rect.width}×${rect.height} — ${(result.blob.size / (1024 * 1024)).toFixed(1)}MB`
      }
      downloadLabel="Download cropped video"
      againLabel="Crop another"
      hint={
        <>
          Cropping re-encodes the picture, so this is slower than trimming and the
          result is an MP4. The audio track is copied across untouched.
          {dimensions && (
            <>
              {" "}
              Source is {dimensions.width}×{dimensions.height}.
            </>
          )}
        </>
      }
      options={(disabled) => (
        <div className="space-y-4">
          <OptionGroup label="Aspect ratio">
            <ChoiceRow
              value={preset}
              options={PRESETS}
              onChange={applyPreset}
              disabled={disabled || !dimensions}
            />
          </OptionGroup>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="crop-x"
              label="Left"
              value={rect.x}
              min={0}
              max={dimensions ? dimensions.width - 2 : 10000}
              suffix="px"
              disabled={disabled}
              onChange={(x) => {
                setRect((r) => ({ ...r, x }));
                setPreset("custom");
              }}
            />
            <NumberField
              id="crop-y"
              label="Top"
              value={rect.y}
              min={0}
              max={dimensions ? dimensions.height - 2 : 10000}
              suffix="px"
              disabled={disabled}
              onChange={(y) => {
                setRect((r) => ({ ...r, y }));
                setPreset("custom");
              }}
            />
            <NumberField
              id="crop-w"
              label="Width"
              value={rect.width}
              min={2}
              max={dimensions ? dimensions.width : 10000}
              suffix="px"
              disabled={disabled}
              onChange={(width) => {
                setRect((r) => ({ ...r, width }));
                setPreset("custom");
              }}
            />
            <NumberField
              id="crop-h"
              label="Height"
              value={rect.height}
              min={2}
              max={dimensions ? dimensions.height : 10000}
              suffix="px"
              disabled={disabled}
              onChange={(height) => {
                setRect((r) => ({ ...r, height }));
                setPreset("custom");
              }}
            />
          </div>

          {!inBounds && (
            <p className="text-xs text-error">
              That rectangle runs past the edge of the frame. FFmpeg rejects an
              out-of-bounds crop rather than clamping it.
            </p>
          )}
        </div>
      )}
    />
  );
}
