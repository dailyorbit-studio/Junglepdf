/**
 * Read and rewrite a PDF's document information dictionary.
 *
 * Two jobs in one module because they are the same operation with opposite
 * intent: filling the fields in so a document is findable, and emptying them
 * so it is not. The second is the reason this exists at all — /Author and
 * /Creator routinely carry a real name, a company, and the software licence
 * holder, and people send those files to strangers without ever having seen
 * the fields.
 *
 * Note what this cannot reach: XMP metadata, an XML packet stored alongside
 * the info dictionary that Acrobat writes and often duplicates the same values
 * into. pdf-lib has no XMP API, so a stripped file can still carry a name in
 * its XMP stream. The UI says so rather than implying the document is clean.
 */

import { loadPDF } from "./pdf-utils";

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string | null;
  modificationDate: string | null;
}

export interface MetadataResult {
  blob: Blob;
  filename: string;
  /** Fields that held a value before the edit — what a reader would have seen. */
  clearedFields: string[];
  notice: string | null;
}

const EMPTY: PdfMetadata = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
  creationDate: null,
  modificationDate: null,
};

const asDate = (value: Date | undefined): string | null => {
  if (!value) return null;
  const time = value.getTime();
  return Number.isFinite(time) ? value.toISOString() : null;
};

/**
 * Read what the document currently declares.
 *
 * Every getter is wrapped: pdf-lib throws rather than returning undefined when
 * a date field holds a malformed value, and a single bad /CreationDate — which
 * plenty of generators write — would otherwise fail the whole read.
 */
export async function readMetadata(file: File): Promise<PdfMetadata> {
  const doc = await loadPDF(await file.arrayBuffer(), file.name);
  const read = <T>(fn: () => T, fallback: T): T => {
    try {
      return fn() ?? fallback;
    } catch {
      return fallback;
    }
  };

  return {
    title: read(() => doc.getTitle(), "") ?? "",
    author: read(() => doc.getAuthor(), "") ?? "",
    subject: read(() => doc.getSubject(), "") ?? "",
    keywords: read(() => doc.getKeywords(), "") ?? "",
    creator: read(() => doc.getCreator(), "") ?? "",
    producer: read(() => doc.getProducer(), "") ?? "",
    creationDate: asDate(read(() => doc.getCreationDate(), undefined)),
    modificationDate: asDate(read(() => doc.getModificationDate(), undefined)),
  };
}

/** Human labels, used for the "these fields held something" report. */
const FIELD_LABELS: Record<keyof PdfMetadata, string> = {
  title: "Title",
  author: "Author",
  subject: "Subject",
  keywords: "Keywords",
  creator: "Creator",
  producer: "Producer",
  creationDate: "Created",
  modificationDate: "Modified",
};

function populatedFields(meta: PdfMetadata): string[] {
  return (Object.keys(FIELD_LABELS) as (keyof PdfMetadata)[])
    .filter((key) => {
      const value = meta[key];
      return typeof value === "string" ? value.trim().length > 0 : value !== null;
    })
    .map((key) => FIELD_LABELS[key]);
}

const XMP_CAVEAT =
  "The document information fields are rewritten, but a PDF can also carry the same details in an XMP metadata stream, which this cannot reach. For a file that must be genuinely anonymous, check it in a metadata viewer afterwards.";

/**
 * Write new values, or clear them.
 *
 * Dates are set explicitly rather than left alone: pdf-lib stamps a fresh
 * /ModDate on save regardless, so "cleared" has to mean a value we chose. The
 * epoch is used because there is no way to express "absent" through the API,
 * and a visibly meaningless date is more honest than today's.
 */
export async function writeMetadata(
  file: File,
  meta: PdfMetadata,
  onProgress?: (step: string, pct: number) => void
): Promise<MetadataResult> {
  onProgress?.("Reading PDF…", 15);

  const original = await readMetadata(file);
  const doc = await loadPDF(await file.arrayBuffer(), file.name);

  onProgress?.("Writing metadata…", 55);

  doc.setTitle(meta.title);
  doc.setAuthor(meta.author);
  doc.setSubject(meta.subject);
  doc.setKeywords(meta.keywords ? meta.keywords.split(/\s*,\s*/).filter(Boolean) : []);
  doc.setCreator(meta.creator);
  doc.setProducer(meta.producer);

  const parse = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  };

  doc.setCreationDate(parse(meta.creationDate) ?? new Date(0));
  doc.setModificationDate(parse(meta.modificationDate) ?? new Date(0));

  onProgress?.("Saving…", 85);

  const bytes = await doc.save();
  onProgress?.("Done", 100);

  return {
    blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + "_metadata.pdf",
    clearedFields: populatedFields(original),
    notice: XMP_CAVEAT,
  };
}

/** Clear every field in one call — the privacy path. */
export async function stripMetadata(
  file: File,
  onProgress?: (step: string, pct: number) => void
): Promise<MetadataResult> {
  const result = await writeMetadata(file, { ...EMPTY }, onProgress);
  return {
    ...result,
    filename: file.name.replace(/\.pdf$/i, "") + "_clean.pdf",
  };
}

/** A fresh, empty set — what the editor starts from for a "clear all". */
export function emptyMetadata(): PdfMetadata {
  return { ...EMPTY };
}

/** Kept exported so the page copy and the tool cannot drift apart. */
export function describeMetadataLimits(): string[] {
  return [
    "Rewrites the document information dictionary — Title, Author, Subject, Keywords, Creator and Producer.",
    "Does not touch XMP metadata, which some generators write in parallel with the same values.",
    "Page content is untouched: a name printed inside the document itself is not metadata and stays where it is.",
  ];
}
