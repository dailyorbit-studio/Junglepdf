"use client";

import { useCallback, useState, useRef, useMemo } from "react";

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

export default function FileDropZone({
  accept,
  multiple = false,
  maxFileSizeMB,
  maxFiles = 20,
  onFiles,
  label = "Drop your file here, or click to browse",
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

      // Rate limit: max file count
      if (files.length > maxFiles) {
        setError(`You can upload at most ${maxFiles} files at a time.`);
        return;
      }

      // Validate each file
      const maxBytes = maxFileSizeMB * 1024 * 1024;
      const validated: File[] = [];

      for (const file of files) {
        const ext = getExtension(file.name);

        // Extension check
        if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
          const shown = allowedExts.slice(0, 6).join(", ");
          const more = allowedExts.length > 6 ? ", …" : "";
          setError(`"${file.name}" isn't a supported file type. Allowed: ${shown}${more}`);
          return;
        }

        // Size check
        if (file.size > maxBytes) {
          setError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB — exceeds the ${maxFileSizeMB}MB limit.`);
          return;
        }

        // Zero-byte check
        if (file.size === 0) {
          setError(`"${file.name}" appears to be empty.`);
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

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        className={`
          relative w-full rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 ease-[var(--ease-smooth)]
          ${dragging
            ? "border-accent bg-accent-subtle"
            : "border-border hover:border-ink-muted hover:bg-surface-raised"
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
        aria-label={label}
      >
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
          {/* Upload icon */}
          <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p className="text-sm font-medium text-ink mb-1">{label}</p>
          <p className="text-xs text-ink-muted">
            {sublabel || `Max ${sizeLabel} per file${multiple ? ` · Up to ${maxFiles} files` : ""}`}
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

      {error && (
        <div role="alert" className="mt-3 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
