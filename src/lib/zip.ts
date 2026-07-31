/**
 * ZIP bundling — JSZip
 *
 * Several tools produce many files from one input (split PDF, PDF to images,
 * favicon sets). Handing the user 30 separate download clicks is not a
 * feature, so those tools bundle instead.
 *
 * JSZip is imported dynamically so it stays out of the initial bundle for the
 * tools that never zip anything.
 */

export interface ZipEntry {
  filename: string;
  blob: Blob;
}

/**
 * Bundle entries into a single ZIP blob.
 *
 * Uses DEFLATE at level 6. Most inputs here (PDF, JPEG, PNG) are already
 * compressed, so a higher level costs seconds and saves almost nothing.
 */
export async function createZip(
  entries: ZipEntry[],
  onProgress?: (step: string, pct: number) => void
): Promise<Blob> {
  if (entries.length === 0) {
    throw new Error("There is nothing to bundle.");
  }

  onProgress?.("Loading compressor…", 5);

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  // Duplicate names silently overwrite each other in a ZIP, so disambiguate.
  const used = new Set<string>();

  for (const entry of entries) {
    let name = entry.filename;
    if (used.has(name)) {
      const dot = name.lastIndexOf(".");
      const stem = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : "";
      let n = 2;
      while (used.has(`${stem} (${n})${ext}`)) n++;
      name = `${stem} (${n})${ext}`;
    }
    used.add(name);

    zip.file(name, await entry.blob.arrayBuffer());
  }

  onProgress?.("Compressing…", 20);

  return zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    (meta) => onProgress?.("Compressing…", 20 + Math.round(meta.percent * 0.75))
  );
}
