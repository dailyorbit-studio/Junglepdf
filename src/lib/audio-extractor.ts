/**
 * Audio Extractor — FFmpeg WASM
 *
 * Pulls the audio track out of a video container and re-encodes it as MP3.
 * The engine itself lives in ffmpeg.ts, shared with the other media tools.
 */

import { runFFmpegJob, type ProgressFn } from "./ffmpeg";

export interface ExtractResult {
  blob: Blob;
  filename: string;
}

/**
 * Extract audio from a video file as MP3.
 */
export async function extractAudioFromVideo(
  file: File,
  onProgress?: ProgressFn
): Promise<ExtractResult> {
  const blob = await runFFmpegJob(
    {
      file,
      inputName: "input_video",
      outputName: "output.mp3",
      args: [
        "-vn",                // Drop video stream
        "-acodec", "libmp3lame",
        "-ab", "192k",        // 192kbps bitrate
        "-ar", "44100",       // 44.1kHz sample rate
      ],
      outputMime: "audio/mpeg",
      label: "Extracting audio track…",
      band: [40, 85],
      failureMessage:
        "FFmpeg couldn't process this file. It may be corrupted, or have no audio track.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  const baseName = file.name.replace(/\.[^.]+$/, "");

  return { blob, filename: `${baseName}.mp3` };
}
