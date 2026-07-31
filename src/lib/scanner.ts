/**
 * PDF Scanner — camera capture → pages
 *
 * Uses the device camera through getUserMedia, captures frames to a canvas,
 * enhances them for legibility, and hands the result to the existing
 * `imagesToPDF` engine. Assembling the document is a solved problem here; the
 * new part is the capture and the clean-up.
 *
 * Two constraints worth knowing about:
 *
 *  - **Secure context only.** getUserMedia is unavailable over plain HTTP
 *    except on localhost, so a phone browsing the site over http:// on a LAN
 *    address gets nothing. That failure is detected and named, because the
 *    generic browser error tells the user nothing useful.
 *  - **No edge detection or deskewing.** Finding a page's corners in a
 *    photograph and warping it flat is real computer vision — in practice
 *    OpenCV, several megabytes of WebAssembly. What is achievable cheaply is
 *    the tonal work below, which is most of what makes a phone photo of a page
 *    readable. Hold the phone square to the page.
 */

import { createSurface } from "./canvas-utils";
import { imagesToPDF, type ImagesToPdfOptions, type ImagesToPdfResult } from "./images-to-pdf";
import type { ProgressFn } from "./ffmpeg";

export type ScanMode = "document" | "greyscale" | "photo";

export const SCAN_MODE_LABELS: Record<ScanMode, string> = {
  document: "Document",
  greyscale: "Greyscale",
  photo: "Colour photo",
};

export const SCAN_MODE_NOTES: Record<ScanMode, string> = {
  document: "High contrast, whites cleaned up. Best for printed text.",
  greyscale: "Neutral grey. Good for pencil, photos of text, and mixed pages.",
  photo: "No processing. Use when colour matters.",
};

/**
 * Open the rear camera at as high a resolution as the device will give.
 *
 * `ideal` rather than `exact` throughout: a device with only a front camera,
 * or one that cannot do 1080p, should still work rather than throwing.
 */
export async function startCamera(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      throw new Error(
        "The camera is only available on a secure connection. Open this page over https:// (or on localhost) and try again."
      );
    }
    throw new Error("This browser does not support camera access.");
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
  } catch (err) {
    const name = (err as { name?: string })?.name ?? "";

    if (name === "NotAllowedError" || name === "SecurityError") {
      throw new Error(
        "Camera access was blocked. Allow it for this site in your browser's address bar, then try again."
      );
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      throw new Error("No camera was found on this device.");
    }
    if (name === "NotReadableError") {
      throw new Error(
        "The camera is already in use by another app. Close it and try again."
      );
    }
    throw new Error("The camera could not be started.");
  }
}

export function stopCamera(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

/**
 * Tonal clean-up for a photographed page.
 *
 * `document` mode is the one that matters. A phone photo of white paper is
 * never white — it is grey, unevenly lit, and prints as a grubby rectangle. So
 * the pixels are converted to luminance, then a contrast curve is applied that
 * pushes the paper to white and the ink to black while leaving the midtones
 * that carry faint pencil or a light stamp.
 *
 * A pure threshold would be sharper and would also erase anything faint, which
 * is exactly what people scanning a receipt or a signed form cannot afford.
 */
function enhance(data: ImageData, mode: ScanMode): void {
  if (mode === "photo") return;

  const pixels = data.data;
  const contrast = mode === "document" ? 1.9 : 1.0;
  const midpoint = mode === "document" ? 150 : 128;

  for (let i = 0; i < pixels.length; i += 4) {
    // Rec. 601 luma: matches how the eye weights the channels, so coloured ink
    // and highlighter darken sensibly instead of vanishing.
    const luma = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;

    let value = luma;
    if (contrast !== 1) {
      value = (luma - midpoint) * contrast + 200;
    }

    const clamped = value < 0 ? 0 : value > 255 ? 255 : value;
    pixels[i] = clamped;
    pixels[i + 1] = clamped;
    pixels[i + 2] = clamped;
  }
}

/** Grab the current video frame as a JPEG page. */
export async function captureFrame(
  video: HTMLVideoElement,
  mode: ScanMode
): Promise<Blob> {
  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    throw new Error("The camera is not ready yet — wait for the preview to appear.");
  }

  const surface = createSurface(width, height);
  surface.ctx.drawImage(video, 0, 0, width, height);

  if (mode !== "photo") {
    const data = surface.ctx.getImageData(0, 0, width, height);
    enhance(data, mode);
    surface.ctx.putImageData(data, 0, 0);
  }

  // JPEG at 88%: these are photographs, and PNG would multiply the size of a
  // multi-page scan for no visible gain.
  return surface.toBlob("image/jpeg", 0.88);
}

/** Turn captured pages into a PDF, reusing the images-to-PDF engine. */
export async function scanToPDF(
  pages: Blob[],
  options: ImagesToPdfOptions,
  onProgress?: ProgressFn
): Promise<ImagesToPdfResult> {
  if (pages.length === 0) {
    throw new Error("Capture at least one page first.");
  }

  const files = pages.map(
    (blob, i) => new File([blob], `scan-${String(i + 1).padStart(3, "0")}.jpg`, { type: "image/jpeg" })
  );

  const result = await imagesToPDF(files, options, onProgress);
  return { ...result, filename: "scan.pdf" };
}
