/**
 * Audio Extractor — FFmpeg WASM
 *
 * Pulls the audio track out of a video container and re-encodes it as MP3.
 * The engine itself lives in ffmpeg.ts, shared with the other media tools.
 *
 * The stream table is read before anything is encoded. A video with no audio
 * track is not an error case worth an encoder pass — it is the single most
 * common reason this tool fails, and the person holding the file deserves to
 * be told that rather than handed a sentence that also mentions corruption.
 */

import {
  withFFmpeg,
  readOutput,
  fetchFile,
  hasAudioStream,
  type ProgressFn,
} from "./ffmpeg";

export interface ExtractResult {
  blob: Blob;
  filename: string;
}

/**
 * Extract audio from a video file as MP3.
 *
 * @throws when the container carries no audio stream, naming that specifically.
 */
export async function extractAudioFromVideo(
  file: File,
  onProgress?: ProgressFn
): Promise<ExtractResult> {
  // Keep the source extension on the virtual input. FFmpeg falls back to
  // content probing without one, which works for MP4 but is weaker for the
  // containers whose magic bytes are ambiguous — AVI and WMV among them.
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? "mp4";

  return withFFmpeg(async (ffmpeg, track) => {
    const inputName = track(`input.${ext}`);
    const outputName = track("output.mp3");

    onProgress?.("Reading file…", 25);
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    onProgress?.("Checking for an audio track…", 32);

    if (!(await hasAudioStream(ffmpeg, inputName))) {
      throw new Error(
        `"${file.name}" has no audio track — it is video only, so there is nothing to extract. ` +
          `Screen recordings and silent exports are the usual culprits.`
      );
    }

    onProgress?.("Extracting audio track…", 40);

    const handleProgress = ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress));
      onProgress?.("Extracting audio track…", 40 + Math.round(clamped * 45));
    };
    ffmpeg.on("progress", handleProgress);

    const log: string[] = [];
    const handleLog = ({ message }: { message: string }) => {
      log.push(message);
      if (log.length > 40) log.shift();
    };
    ffmpeg.on("log", handleLog);

    try {
      const exit = await ffmpeg.exec([
        "-i", inputName,
        "-vn",                    // Drop the video stream, and any cover art with it
        "-acodec", "libmp3lame",
        "-b:a", "192k",           // 192kbps — transparent enough for speech and music alike
        "-ar", "44100",           // 44.1kHz sample rate
        "-y", outputName,
      ]);

      if (exit !== 0) {
        const tail = log
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && !/^\s*(Stream|Metadata|Duration|Input|Output)/i.test(line))
          .pop();

        throw new Error(
          tail
            ? `FFmpeg couldn't extract the audio from this file. (FFmpeg said: ${tail})`
            : "FFmpeg couldn't extract the audio from this file. It may be corrupted."
        );
      }
    } finally {
      ffmpeg.off("progress", handleProgress);
      ffmpeg.off("log", handleLog);
    }

    const blob = await readOutput(
      ffmpeg,
      outputName,
      "audio/mpeg",
      "The extracted audio came out empty. The audio track may be damaged."
    );

    onProgress?.("Done", 100);

    return {
      blob,
      filename: `${file.name.replace(/\.[^.]+$/, "")}.mp3`,
    };
  }, onProgress);
}
