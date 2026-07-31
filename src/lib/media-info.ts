/**
 * Media metadata via a hidden media element.
 *
 * Duration and dimensions are needed before any tool can offer a trim range,
 * and asking FFmpeg for them means loading 32MB of WASM just to read a
 * header. A <video> or <audio> element answers the same question in
 * milliseconds using the browser's own demuxers.
 *
 * The tradeoff: the browser has to support the container. When it does not,
 * the caller falls back to letting FFmpeg do the work.
 */

export interface MediaInfo {
  duration: number;
  /** Zero for audio-only files. */
  width: number;
  height: number;
  hasVideo: boolean;
}

export function readMediaInfo(file: File, kind: "video" | "audio"): Promise<MediaInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const element = document.createElement(kind);

    const cleanup = () => {
      element.removeAttribute("src");
      element.load();
      URL.revokeObjectURL(url);
    };

    element.preload = "metadata";

    element.onloadedmetadata = () => {
      const width = kind === "video" ? (element as HTMLVideoElement).videoWidth : 0;
      const height = kind === "video" ? (element as HTMLVideoElement).videoHeight : 0;
      const duration = element.duration;
      cleanup();

      // A stream with no known length reports Infinity. Nothing downstream
      // can build a trim range out of that, so treat it as unreadable.
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(
          new Error(
            "This file's duration couldn't be determined. It may be corrupted, or use a container your browser can't inspect."
          )
        );
        return;
      }

      resolve({ duration, width, height, hasVideo: width > 0 && height > 0 });
    };

    element.onerror = () => {
      cleanup();
      reject(
        new Error(
          `Your browser can't read this ${kind} file. It may be corrupted, or in a format it doesn't support.`
        )
      );
    };

    element.src = url;
  });
}

/** Seconds as H:MM:SS.mmm — the form FFmpeg's -ss and -to accept. */
export function toTimestamp(seconds: number): string {
  const total = Math.max(0, seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${secs.toFixed(3).padStart(6, "0")}`;
}

/** Seconds as M:SS — for display. */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
