"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup, ChoiceRow } from "@/components/FileToolRunner";
import {
  rotateVideo,
  VIDEO_TRANSFORM_LABELS,
  type VideoTransform,
  type VideoResult,
} from "@/lib/video-tools";

const OPTIONS = (Object.keys(VIDEO_TRANSFORM_LABELS) as VideoTransform[]).map((value) => ({
  value,
  label: VIDEO_TRANSFORM_LABELS[value],
}));

export default function RotateVideoTool() {
  const [transform, setTransform] = useState<VideoTransform>("rotate90");

  return (
    <FileToolRunner<VideoResult & { notice?: string | null }>
      accept=".mp4,.mkv,.avi,.webm,.mov"
      maxFileSizeMB={500}
      dropLabel="Drop a video here, or click to browse"
      dropSublabel="MP4, MKV, AVI, WebM or MOV — up to 500MB"
      run={(file, onProgress) => rotateVideo(file, transform, onProgress)}
      actionLabel="Rotate video"
      busyLabel="Rotating…"
      resultTitle="Video rotated"
      resultDetail={(result) =>
        `${VIDEO_TRANSFORM_LABELS[transform]} — ${(result.blob.size / (1024 * 1024)).toFixed(1)}MB`
      }
      downloadLabel="Download rotated video"
      againLabel="Rotate another"
      hint="The rotation is baked into the frames rather than written as a metadata flag, so the file looks right in every player and editor. That means a re-encode, and an MP4 out."
      options={(disabled) => (
        <OptionGroup label="Transform">
          <ChoiceRow
            value={transform}
            options={OPTIONS}
            onChange={setTransform}
            disabled={disabled}
          />
        </OptionGroup>
      )}
    />
  );
}
