/**
 * Shared FFmpeg WASM runtime.
 *
 * The ~32MB core loads once per tab and is reused by every audio and video
 * tool. Extracted from audio-extractor once a second tool needed it — two
 * modules each holding their own singleton would mean loading the binary
 * twice for someone who converts an audio file and then trims a video.
 *
 * The core is served from our own origin (public/ffmpeg, populated from
 * node_modules by scripts/copy-vendor-assets.mjs at build time) rather than a
 * CDN — a third-party fetch would break the "works offline" promise and put
 * the tools at the mercy of someone else's uptime.
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const CORE_BASE = "/ffmpeg";

export type ProgressFn = (step: string, pct: number) => void;

/** True once the core is in memory — lets the UI skip the "this will take a moment" copy. */
export function isEngineLoaded(): boolean {
  return ffmpegInstance !== null;
}

/**
 * Load the FFmpeg WASM instance (singleton).
 */
export async function getFFmpeg(onProgress?: ProgressFn): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  // Concurrent callers must share one load rather than racing two 32MB fetches.
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    onProgress?.("Loading media engine…", 5);

    const ffmpeg = new FFmpeg();

    try {
      await ffmpeg.load({
        // Left to itself, @ffmpeg/ffmpeg builds its worker from
        // `new URL("./worker.js", import.meta.url)`. Turbopack cannot resolve
        // that and the load dies with "Cannot find module as expression is
        // too dynamic". Pointing at our own copy sidesteps the bundler
        // entirely — and it is served from this origin like the core, so the
        // no-third-party-fetch guarantee still holds.
        //
        // It must stay a real URL rather than a blob: the worker imports
        // ./const.js and ./errors.js relative to its own location, and a blob
        // URL has no directory for those to resolve against.
        classWorkerURL: new URL(`${CORE_BASE}/worker.js`, window.location.origin).href,
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      });
    } catch {
      throw new Error(
        "The media engine failed to load. Check your connection and reload the page."
      );
    }

    ffmpegInstance = ffmpeg;
    onProgress?.("Media engine ready", 20);
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null; // let the next attempt retry
    throw err;
  }
}

/**
 * Turn the tail of FFmpeg's log into something a person can act on.
 *
 * FFmpeg reports failures on stderr and then exits non-zero; the exit code
 * alone says nothing. Without this, every tool could only guess at the cause,
 * so a file with no audio track and a genuinely corrupt one produced the same
 * "it may be corrupted, or…" sentence and left the user with nothing to do.
 *
 * Only the lines that actually diagnose something are kept — the banner, the
 * build flags and the stream table are noise in an error message.
 */
function diagnose(log: string[]): string | null {
  const meaningful = log
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !/^(ffmpeg version|built with|configuration:|lib[a-z]+\s+\d)/i.test(line) &&
        !/^(Input|Output) #\d/.test(line) &&
        !/^\s*(Stream|Metadata|Duration|encoder|handler_name|major_brand|minor_version|compatible_brands)/i.test(
          line
        )
    );

  const last = meaningful[meaningful.length - 1];
  if (!last) return null;

  // FFmpeg prefixes fatal errors with the offending file or muxer, e.g.
  // "output.mp3: Invalid argument". Keep the whole line — the prefix is the
  // useful half.
  return last.length > 200 ? `${last.slice(0, 200)}…` : last;
}

export interface FFmpegJob {
  file: File;
  /** Name the file gets in the virtual FS. The extension matters — FFmpeg
   *  uses it to pick a demuxer when the container is ambiguous. */
  inputName: string;
  outputName: string;
  /** Arguments after the input. `-i <inputName>` is prepended for you. */
  args: string[];
  outputMime: string;
  /** Shown next to the progress bar during the encode. */
  label: string;
  /** Progress bar range this job occupies, e.g. [30, 90]. */
  band: [number, number];
  /** Message when FFmpeg exits non-zero. Name the likely cause. */
  failureMessage: string;
}

/**
 * Run one input through FFmpeg and return the output as a Blob.
 *
 * Always clears the virtual filesystem afterwards: a failed run would
 * otherwise leave a multi-hundred-MB file wired into the WASM heap for the
 * lifetime of the tab.
 */
export async function runFFmpegJob(
  job: FFmpegJob,
  onProgress?: ProgressFn
): Promise<Blob> {
  const ffmpeg = await getFFmpeg(onProgress);

  onProgress?.("Reading file…", job.band[0]);

  const [from, to] = job.band;
  const handleProgress = ({ progress }: { progress: number }) => {
    const clamped = Math.max(0, Math.min(1, progress));
    onProgress?.(job.label, from + Math.round(clamped * (to - from)));
  };
  ffmpeg.on("progress", handleProgress);

  // Kept in a ring so a long encode's log cannot grow without bound; only the
  // tail matters, because that is where FFmpeg prints why it gave up.
  const log: string[] = [];
  const handleLog = ({ message }: { message: string }) => {
    log.push(message);
    if (log.length > 60) log.shift();
  };
  ffmpeg.on("log", handleLog);

  try {
    await ffmpeg.writeFile(job.inputName, await fetchFile(job.file));

    onProgress?.(job.label, from);

    // -y matters even on a fresh virtual FS: a run that died between exec and
    // cleanup leaves the output behind, and the next attempt in the same tab
    // would sit forever on an overwrite prompt that has no stdin to answer it.
    const exitCode = await ffmpeg.exec([
      "-i", job.inputName,
      ...job.args,
      "-y", job.outputName,
    ]);

    if (exitCode !== 0) {
      const reason = diagnose(log);
      throw new Error(reason ? `${job.failureMessage} (FFmpeg said: ${reason})` : job.failureMessage);
    }

    return await readOutput(ffmpeg, job.outputName, job.outputMime, job.failureMessage);
  } finally {
    ffmpeg.off("progress", handleProgress);
    ffmpeg.off("log", handleLog);
    await ffmpeg.deleteFile(job.inputName).catch(() => {});
    await ffmpeg.deleteFile(job.outputName).catch(() => {});
  }
}

/**
 * Does this file carry an audio stream?
 *
 * There is no ffprobe in this build, but running FFmpeg with an input and no
 * output makes it print the stream table on its way to exiting non-zero, which
 * is enough to read.
 *
 * Asked by Video to MP3 before it encodes anything, and by the merge and speed
 * tools, which build a filter graph referencing `[0:a]` that would fail outright
 * on a silent clip. It lives here rather than in video-tools because the audio
 * side needs it too, and a second copy would be a second thing to fix.
 */
export async function hasAudioStream(ffmpeg: FFmpeg, name: string): Promise<boolean> {
  let found = false;

  const onLog = ({ message }: { message: string }) => {
    if (/Stream #\d+:\d+.*: Audio:/.test(message)) found = true;
  };

  ffmpeg.on("log", onLog);
  try {
    // Exits non-zero ("At least one output file must be specified") after
    // printing the stream table. That is the intended path, not a failure.
    await ffmpeg.exec(["-i", name]);
  } catch {
    // Some builds reject rather than returning a code. Either way the log
    // handler has already seen whatever streams were printed.
  } finally {
    ffmpeg.off("log", onLog);
  }

  return found;
}

/**
 * Read a file out of the virtual FS as a Blob.
 *
 * readFile can hand back a Uint8Array backed by a SharedArrayBuffer, which is
 * not a valid BlobPart, so the bytes are copied into a plain buffer.
 */
export async function readOutput(
  ffmpeg: FFmpeg,
  name: string,
  mime: string,
  emptyMessage: string
): Promise<Blob> {
  const data = (await ffmpeg.readFile(name)) as Uint8Array;

  if (data.length === 0) throw new Error(emptyMessage);

  const copied = new Uint8Array(data.length);
  copied.set(data);
  return new Blob([copied], { type: mime });
}

/**
 * Run arbitrary work against the shared instance, cleaning up every file
 * touched along the way.
 *
 * For jobs a single exec cannot express — GIF encoding, for instance, needs a
 * palette pass whose output feeds the second pass.
 */
export async function withFFmpeg<T>(
  work: (ffmpeg: FFmpeg, track: (name: string) => string) => Promise<T>,
  onProgress?: ProgressFn
): Promise<T> {
  const ffmpeg = await getFFmpeg(onProgress);
  const touched: string[] = [];

  const track = (name: string) => {
    touched.push(name);
    return name;
  };

  try {
    return await work(ffmpeg, track);
  } finally {
    for (const name of touched) {
      await ffmpeg.deleteFile(name).catch(() => {});
    }
  }
}

export { fetchFile };
