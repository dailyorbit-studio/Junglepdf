/**
 * Reading ZIP archives.
 *
 * The counterpart to `zip.ts`, which only ever writes. JSZip is already a
 * dependency and is already dynamically imported there for the same reason it
 * is here: it should not sit in the bundle of the fifty tools that never touch
 * an archive.
 *
 * Everything stays in memory. That is the whole reason this can exist at all
 * as a client-side tool — but it also sets the ceiling, because an archive
 * that unpacks to more than the tab's heap will fail rather than stream.
 */

export interface ArchiveEntry {
  /** Full path inside the archive, directories included. */
  path: string;
  /** Just the file name, for display. */
  name: string;
  /** Uncompressed size in bytes. */
  size: number;
  date: Date | null;
  /** True for directory records, which have no contents to extract. */
  isDirectory: boolean;
  /** Set when the entry cannot be read — encrypted, mostly. */
  problem: string | null;
}

export interface ArchiveListing {
  entries: ArchiveEntry[];
  fileCount: number;
  totalSize: number;
  notice: string | null;
}

/**
 * A path that escapes the extraction root, or an absolute one.
 *
 * Checked even though nothing here writes to a filesystem: the paths are shown
 * in the UI and used as download filenames, and a crafted archive containing
 * `../../.bashrc` should not be presented as though it were a normal file.
 */
function isUnsafePath(path: string): boolean {
  return (
    path.startsWith("/") ||
    path.startsWith("\\") ||
    /^[a-zA-Z]:/.test(path) ||
    path.split(/[\\/]/).includes("..")
  );
}

/** Strip directories from a path for use as a download filename. */
function baseName(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

/**
 * Read the archive's table of contents without decompressing the payloads.
 *
 * Listing first, extracting second, is the honest order for a tool that runs
 * in a tab: the listing is cheap, and it lets someone with a 2GB archive see
 * what is in it and pull out the one file they wanted instead of watching the
 * page run out of memory unpacking all of it.
 */
export async function readArchive(file: File): Promise<ArchiveListing> {
  const { default: JSZip } = await import("jszip");

  let zip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error(
      "This file could not be read as a ZIP archive. RAR, 7z and tar.gz use different formats — this tool only opens ZIP."
    );
  }

  const entries: ArchiveEntry[] = [];
  let totalSize = 0;
  let unsafe = 0;

  zip.forEach((path, entry) => {
    // JSZip's typings do not expose the internal size fields, which are the
    // only place the uncompressed length is recorded before inflation.
    const raw = entry as unknown as {
      _data?: { uncompressedSize?: number };
      options?: { compression?: string };
    };
    const size = raw._data?.uncompressedSize ?? 0;

    if (!entry.dir) totalSize += size;

    const problem = isUnsafePath(path)
      ? "This path points outside the archive folder. It has been renamed for download."
      : null;

    if (problem) unsafe++;

    entries.push({
      path,
      name: baseName(path),
      size,
      date: entry.date ?? null,
      isDirectory: entry.dir,
      problem,
    });
  });

  if (entries.length === 0) {
    throw new Error("This archive is empty — there are no files inside it.");
  }

  // Encryption is deliberately not reported here: JSZip cannot tell from the
  // central directory alone, and only fails when an entry is actually
  // inflated. `extractEntry` names it at that point rather than guessing now.
  const notes: string[] = [];
  if (unsafe > 0) {
    notes.push(
      `${unsafe} ${unsafe === 1 ? "entry has a path that points" : "entries have paths that point"} outside the archive folder. Downloads use the file name only.`
    );
  }
  if (totalSize > 500 * 1024 * 1024) {
    notes.push(
      `This unpacks to about ${(totalSize / (1024 * 1024)).toFixed(0)}MB. Everything is held in your browser's memory, so a large extraction may fail on a phone.`
    );
  }

  return {
    entries: entries.sort((a, b) => a.path.localeCompare(b.path)),
    fileCount: entries.filter((e) => !e.isDirectory).length,
    totalSize,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}

/** Pull one entry out as a blob, ready to download. */
export async function extractEntry(
  file: File,
  path: string
): Promise<{ blob: Blob; filename: string }> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entry = zip.file(path);

  if (!entry) {
    throw new Error(`"${path}" is no longer in this archive.`);
  }

  let blob: Blob;
  try {
    blob = await entry.async("blob");
  } catch {
    throw new Error(
      `"${baseName(path)}" could not be extracted. Password-protected entries cannot be opened here.`
    );
  }

  return { blob, filename: baseName(path) };
}

/**
 * Extract everything and re-bundle it as a flat ZIP.
 *
 * Re-zipping rather than firing one download per file: a browser blocks a
 * burst of downloads after the first few, so a 40-file archive would silently
 * deliver three of them. The rebuild also normalises the unsafe paths.
 */
export async function extractAll(
  file: File,
  onProgress?: (step: string, pct: number) => void
): Promise<{ blob: Blob; filename: string; fileCount: number }> {
  const { default: JSZip } = await import("jszip");

  onProgress?.("Reading archive…", 10);

  const source = await JSZip.loadAsync(await file.arrayBuffer());
  const output = new JSZip();

  const files: { path: string; entry: import("jszip").JSZipObject }[] = [];
  source.forEach((path, entry) => {
    if (!entry.dir) files.push({ path, entry });
  });

  if (files.length === 0) {
    throw new Error("This archive contains only folders — there is nothing to extract.");
  }

  for (let i = 0; i < files.length; i++) {
    const { path, entry } = files[i];
    const safePath = isUnsafePath(path) ? baseName(path) : path;
    output.file(safePath, await entry.async("uint8array"));
    onProgress?.("Extracting…", 15 + Math.round(((i + 1) / files.length) * 65));
  }

  onProgress?.("Rebuilding…", 85);

  // STORE, not DEFLATE: the contents were just decompressed and re-compressing
  // them costs seconds to arrive at the size they already were.
  const blob = await output.generateAsync({ type: "blob", compression: "STORE" });

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.zip$/i, "") + "_extracted.zip",
    fileCount: files.length,
  };
}

/** Format a byte count for the listing. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
