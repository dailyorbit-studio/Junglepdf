"use client";

import { useCallback, useState, useRef, useMemo } from "react";
import ErrorMessage from "./ErrorMessage";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  maxFileSizeMB: number;
  maxFiles?: number;
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
}

// Allowed extensions per category (validated client-side)
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".wma"],
  video: [".mp4", ".mkv", ".avi", ".webm", ".mov", ".wmv", ".flv"],
  image: [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".bmp", ".tiff"],
  pdf: [".pdf"],
};

/**
 * How a format is spelled to a person, where shouting it is wrong.
 * "WEBP" and "JPEG" are how the extension looks uppercased; they are not how
 * anyone writes them.
 */
const FORMAT_CASING: Record<string, string> = {
  webp: "WebP",
  webm: "WebM",
  jpeg: "JPEG",
  jpg: "JPG",
  tiff: "TIFF",
  avif: "AVIF",
};

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

function getAllAllowedExtensions(accept: string): string[] {
  const extensions = new Set<string>();

  for (const part of accept.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (part.startsWith(".")) {
      extensions.add(part.toLowerCase());
      continue;
    }

    // MIME-based: map only the matching category. Falling back to every
    // known extension here would let a PDF tool accept an MP3.
    const category = part.split("/")[0].toLowerCase();
    const mapped = ALLOWED_EXTENSIONS[category === "application" ? "pdf" : category];
    if (mapped) mapped.forEach((ext) => extensions.add(ext));
  }

  return [...extensions];
}

/** ".mp4, .mkv, .avi" → "MP4, MKV, AVI" — capped, because ten of them is a wall. */
function describeFormats(exts: string[]): string {
  const names = exts.map((e) => {
    const bare = e.replace(/^\./, "");
    return FORMAT_CASING[bare] ?? bare.toUpperCase();
  });
  if (names.length <= 5) return names.join(", ");
  return `${names.slice(0, 5).join(", ")} and ${names.length - 5} more`;
}

export default function FileDropZone({
  accept,
  multiple = false,
  maxFileSizeMB,
  maxFiles = 20,
  onFiles,
  label,
  sublabel,
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const allowedExts = useMemo(() => getAllAllowedExtensions(accept), [accept]);

  const validateAndEmit = useCallback(
    (fileList: FileList | null) => {
      setError(null);
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);

      // Rate limit: max file count.
      //
      // Not "upload" — nothing here is uploaded, and this control is the exact
      // place someone is deciding whether to trust that claim. Saying the
      // opposite word in the failure case undoes the promise made everywhere
      // else on the page.
      if (files.length > maxFiles) {
        setError(
          `That's ${files.length} files — this tool takes up to ${maxFiles} at a time. Try again with fewer.`
        );
        return;
      }

      const maxBytes = maxFileSizeMB * 1024 * 1024;
      const validated: File[] = [];

      for (const file of files) {
        const ext = getExtension(file.name);

        if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
          const kind = ext ? `a ${ext.replace(/^\./, "").toUpperCase()} file` : "that kind of file";
          setError(
            `This tool can't open ${kind}. It works with ${describeFormats(allowedExts)}.`
          );
          return;
        }

        if (file.size > maxBytes) {
          setError(
            `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, and the limit here is ${maxFileSizeMB}MB. ` +
              `The limit exists because the whole file has to fit in your browser's memory at once.`
          );
          return;
        }

        if (file.size === 0) {
          setError(`"${file.name}" is empty — there is nothing in it to work on.`);
          return;
        }

        validated.push(file);
      }

      onFiles(validated);
    },
    [allowedExts, maxFileSizeMB, maxFiles, onFiles]
  );

  // dragenter/dragleave also fire as the pointer crosses child elements, so
  // count nesting depth instead of toggling on every leave.
  const dragDepth = useRef(0);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      validateAndEmit(e.dataTransfer.files);
    },
    [validateAndEmit]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }, []);

  const sizeLabel =
    maxFileSizeMB >= 1024
      ? `${(maxFileSizeMB / 1024).toFixed(1)}GB`
      : `${maxFileSizeMB}MB`;

  const heading = label ?? (multiple ? "Choose your files" : "Choose your file");

  // Derived rather than required from every caller. A tool that forgets to pass
  // a sublabel used to render "Max 100MB per file" and leave the reader to
  // guess which formats were welcome.
  const formatLine =
    sublabel ??
    `${describeFormats(allowedExts)} · up to ${sizeLabel}${
      multiple ? ` · ${maxFiles} files at once` : ""
    }`;

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        className={`
          group relative w-full rounded-xl border-2 border-dashed cursor-pointer
          transition-colors duration-200 ease-[var(--ease-smooth)]
          ${dragging
            ? "border-accent bg-accent-subtle"
            : "border-border hover:border-accent/60 hover:bg-surface-raised/60"
          }
        `}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label={`${heading}. ${formatLine}`}
      >
        <div className="flex flex-col items-center justify-center py-10 sm:py-14 px-6 text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-200 ${
              dragging ? "bg-accent text-white" : "bg-accent-subtle text-accent"
            }`}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p className="text-base font-semibold text-ink">
            {dragging ? "Let go to add it" : heading}
          </p>

          {/*
            A styled span, not a nested <button>. The whole zone is already the
            control; a real button inside it would be a second tab stop that
            does the identical thing, and clicking it would fire both handlers.
            People still need something that looks pressable — a dashed
            rectangle does not read as clickable to everyone.
          */}
          <span className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-secondary shadow-[var(--shadow-card)] transition-colors duration-200 group-hover:border-accent group-hover:text-accent">
            Browse files
          </span>

          <p className="mt-3 text-xs text-ink-muted">
            or drag and drop · {formatLine}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            validateAndEmit(e.target.files);
            // Reset input so re-selecting the same file works
            e.target.value = "";
          }}
        />
      </div>

      {error && <ErrorMessage className="mt-3">{error}</ErrorMessage>}
    </div>
  );
}
