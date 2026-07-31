/**
 * The tool registry — single source of truth.
 *
 * NavBar, Footer, the homepage, the category pages, and the sitemap all read
 * from here. Adding a tool used to mean editing four hardcoded lists, which
 * is how /audio, /image and /pdf ended up in the nav without existing.
 */

export interface Tool {
  name: string;
  slug: string;
  description: string;
  /** Short blurb for the category index page. */
  summary: string;
  /**
   * Extra search terms. The client-side search matches these alongside the
   * name and description, so "shrink" finds the compressor and "exif" finds
   * the metadata cleaner even though neither word appears in the copy.
   */
  keywords?: string[];
  /**
   * Recently added. No longer drawn anywhere — the badges came off the cards
   * and the nav — but kept as data because it is the only record of when a
   * tool arrived, and it is cheap to render again if that changes.
   */
  isNew?: boolean;
}

export interface ToolCategory {
  label: string;
  slug: string;
  description: string;
  /** Tailwind token names from globals.css @theme. */
  colorClass: string;
  subtleClass: string;
  tools: Tool[];
}

/** A tool plus the category it belongs to — what search and cards actually need. */
export interface ToolWithCategory extends Tool {
  category: ToolCategory;
  href: string;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    label: "Audio",
    slug: "audio",
    description:
      "Extract, trim, and convert audio without uploading a file. Everything runs on your device using the Web Audio API and a WebAssembly build of FFmpeg.",
    colorClass: "text-audio",
    subtleClass: "bg-audio-subtle",
    tools: [
      {
        name: "Video to MP3",
        slug: "video-to-mp3",
        description: "Pull the audio track out of any video file and save it as an MP3.",
        summary:
          "Reads MP4, MKV, AVI, WebM, MOV and more, then re-encodes the audio stream to a 192kbps MP3.",
        keywords: ["extract audio", "mp4 to mp3", "rip audio", "soundtrack", "mov to mp3"],
      },
      {
        name: "Audio Cutter",
        slug: "audio-cutter",
        description: "Trim any audio file to a custom time range. Pick your start and end points.",
        summary:
          "Decodes to raw samples, slices at the sample level, and hands back a lossless WAV.",
        keywords: ["trim", "crop audio", "ringtone", "clip", "shorten"],
      },
      {
        name: "Audio Converter",
        slug: "converter",
        description: "Convert between MP3, WAV, OGG, M4A, and FLAC with a bitrate you choose.",
        summary:
          "FFmpeg re-encodes the stream to your target codec — lossy or lossless, your call.",
        keywords: ["mp3 to wav", "wav to mp3", "flac", "ogg", "m4a", "bitrate", "transcode"],
      },
      {
        name: "Merge Audio",
        slug: "merge",
        description: "Join several audio files end to end into one continuous track.",
        summary:
          "Decodes every input, concatenates the samples, and writes a single lossless WAV.",
        keywords: ["join", "combine", "concatenate", "stitch", "playlist"],
      },
      {
        name: "Volume & Fade",
        slug: "volume",
        description: "Raise or lower volume and add fade-in and fade-out to any audio file.",
        summary:
          "Applies gain and linear ramps sample by sample, with clipping detection before you commit.",
        keywords: ["louder", "quieter", "gain", "normalize", "fade in", "fade out", "boost"],
      },
      {
        name: "Audio Speed",
        slug: "speed",
        description: "Speed audio up or slow it down, with or without shifting the pitch.",
        summary:
          "FFmpeg's atempo filter changes tempo while holding pitch, or resamples when you want the chipmunk effect.",
        keywords: ["tempo", "slow down", "speed up", "pitch", "nightcore", "podcast speed"],
        isNew: true,
      },
      {
        name: "Reverse Audio",
        slug: "reverse",
        description: "Play any audio file backwards and save the result.",
        summary:
          "Decodes to raw samples, reverses every channel in place, and writes a lossless WAV.",
        keywords: ["backwards", "backmask", "flip", "reversed"],
        isNew: true,
      },
    ],
  },
  {
    label: "Image",
    slug: "image",
    description:
      "Compress and resize images to exact targets. Both tools draw to a canvas in your browser — no server ever sees the file.",
    colorClass: "text-image",
    subtleClass: "bg-image-subtle",
    tools: [
      {
        name: "Image Compressor",
        slug: "compressor",
        description:
          "Shrink images to an exact file size. Set a target in KB and let the tool dial in the quality.",
        summary:
          "Binary-searches JPEG quality to find the sharpest version that still fits your size limit.",
        keywords: ["shrink", "reduce size", "optimize", "compress jpg", "compress png", "kb"],
      },
      {
        name: "Image Resizer",
        slug: "resizer",
        description: "Resize images to exact pixel or millimeter dimensions with DPI control.",
        summary:
          "Pixel or millimeter dimensions with DPI conversion, aspect-ratio locking, and JPEG/PNG/WebP output.",
        keywords: ["scale", "dimensions", "passport photo", "dpi", "mm", "pixels", "enlarge"],
      },
      {
        name: "Image Converter",
        slug: "converter",
        description: "Convert between JPG, PNG, WebP, and AVIF without changing dimensions.",
        summary:
          "Re-encodes at full resolution, laying down a white matte when the target format has no alpha.",
        keywords: ["png to jpg", "jpg to png", "webp", "avif", "heic", "format", "transcode"],
      },
      {
        name: "Image Cropper",
        slug: "cropper",
        description: "Crop to any region by dragging, with optional fixed aspect ratios.",
        summary:
          "Drag a selection or lock it to 1:1, 4:3, 16:9 and other presets, then export the region.",
        keywords: ["trim", "cut", "square", "aspect ratio", "profile picture", "thumbnail"],
      },
      {
        name: "Rotate & Flip",
        slug: "rotate",
        description: "Rotate an image in 90° steps and flip it horizontally or vertically.",
        summary:
          "Lossless-looking canvas transforms with a live preview of the final orientation.",
        keywords: ["turn", "mirror", "flip horizontal", "flip vertical", "straighten", "sideways"],
      },
      {
        name: "Favicon Generator",
        slug: "favicon",
        description: "Turn one image into a full favicon and app-icon set, bundled as a ZIP.",
        summary:
          "Renders 16, 32, 48, 180, 192 and 512px icons plus a ready-to-paste HTML snippet.",
        keywords: ["ico", "app icon", "apple touch icon", "site icon", "png to ico"],
      },
      {
        name: "Color Picker",
        slug: "color-picker",
        description: "Pick colors from any image and pull out its dominant palette.",
        summary:
          "Click for an exact pixel value, or extract the top colors as HEX, RGB, and HSL.",
        keywords: ["eyedropper", "hex", "rgb", "hsl", "palette", "dominant color", "swatch"],
      },
      {
        name: "Watermark Image",
        slug: "watermark",
        description: "Stamp text or a logo across an image, with control over size, angle and opacity.",
        summary:
          "Composites the mark on a canvas at your chosen position, tiled or single, before re-encoding.",
        keywords: ["logo", "copyright", "brand", "stamp", "signature", "protect photo"],
        isNew: true,
      },
      {
        name: "Remove EXIF Data",
        slug: "metadata",
        description: "See what your photos reveal — GPS location, camera, timestamps — then strip it out.",
        summary:
          "Parses the EXIF block so you can read it, then re-encodes through a canvas to drop every tag.",
        keywords: ["exif", "gps", "location", "privacy", "metadata", "geotag", "strip"],
        isNew: true,
      },
      {
        name: "Photo Filters",
        slug: "filters",
        description: "Adjust brightness, contrast, saturation, blur and more with a live preview.",
        summary:
          "Uses the canvas filter pipeline, so what you see in the preview is exactly what gets exported.",
        keywords: ["brightness", "contrast", "saturation", "grayscale", "sepia", "blur", "edit"],
        isNew: true,
      },
    ],
  },
  {
    label: "PDF",
    slug: "pdf",
    description:
      "Merge, split, and shrink PDFs locally. Safe for contracts, medical records, and anything else you wouldn't upload to a stranger's server.",
    colorClass: "text-pdf",
    subtleClass: "bg-pdf-subtle",
    tools: [
      {
        name: "Merge PDF",
        slug: "merge-pdf",
        description: "Combine multiple PDF files into one document. Drag to reorder before merging.",
        summary: "Up to 20 files at a time, in whatever order you arrange them.",
        keywords: ["combine", "join", "concatenate", "append", "one file"],
      },
      {
        name: "Split PDF",
        slug: "split-pdf",
        description: "Extract specific pages or page ranges from a PDF into separate files.",
        summary: "Enter ranges like 1-3, 5, 7-10 — each one becomes its own document.",
        keywords: ["separate", "divide", "break apart", "page range", "chapters"],
      },
      {
        name: "Compress PDF",
        slug: "compress-pdf",
        description:
          "Reduce PDF file size by stripping metadata and optimizing the internal structure.",
        summary:
          "Re-serializes with object streams and drops orphaned objects. Returns the original if that doesn't help.",
        keywords: ["shrink", "reduce size", "optimize", "smaller", "email attachment"],
      },
      {
        name: "Rotate PDF",
        slug: "rotate-pdf",
        description: "Turn pages 90, 180, or 270 degrees — all of them, or just the ones you pick.",
        summary:
          "Sets each page's rotation flag, so nothing is re-rendered and no quality is lost.",
        keywords: ["turn", "sideways", "landscape", "portrait", "orientation", "scan"],
      },
      {
        name: "Organize PDF",
        slug: "organize-pdf",
        description: "Delete pages and reorder what's left, working from page thumbnails.",
        summary:
          "Renders every page as a thumbnail so you can see what you're removing before you commit.",
        keywords: ["reorder", "rearrange", "sort pages", "delete pages", "move pages"],
      },
      {
        name: "Add Page Numbers",
        slug: "page-numbers",
        description: "Stamp page numbers onto a PDF with control over position, format, and size.",
        summary:
          "Nine positions, four numbering formats, and an adjustable starting number.",
        keywords: ["pagination", "numbering", "folio", "page count", "bates"],
      },
      {
        name: "Watermark PDF",
        slug: "watermark-pdf",
        description: "Overlay text across every page at the angle and opacity you choose.",
        summary:
          "Diagonal or horizontal text with adjustable size, color, and transparency.",
        keywords: ["draft", "confidential", "stamp", "copyright", "overlay", "brand"],
      },
      {
        name: "Images to PDF",
        slug: "images-to-pdf",
        description: "Combine JPG and PNG images into a single PDF, one image per page.",
        summary:
          "Choose page size and orientation, or let each page match its image exactly.",
        keywords: ["jpg to pdf", "png to pdf", "photo to pdf", "scan to pdf", "picture"],
      },
      {
        name: "PDF to Images",
        slug: "pdf-to-images",
        description: "Export every page of a PDF as a PNG or JPG at the resolution you pick.",
        summary:
          "Rasterises with pdf.js at up to 300 DPI and bundles the results as a ZIP.",
        keywords: ["pdf to jpg", "pdf to png", "export pages", "screenshot", "rasterize"],
      },
      {
        name: "Sign PDF",
        slug: "sign-pdf",
        description: "Draw or type a signature and place it anywhere on the document.",
        summary:
          "Draw with a mouse or finger, or type in a script face — then drag it onto the page you want.",
        keywords: ["signature", "e-sign", "esign", "initials", "contract", "autograph"],
        isNew: true,
      },
      {
        name: "Crop PDF",
        slug: "crop-pdf",
        description: "Trim the margins off a PDF, or crop every page down to a region you choose.",
        summary:
          "Drags a crop box over a live page preview and writes it to the CropBox — no re-rendering.",
        keywords: ["margins", "trim", "whitespace", "resize page", "cut edges"],
        isNew: true,
      },
      {
        name: "Extract Pages",
        slug: "extract-pages",
        description: "Pull the pages you want into a single new PDF and leave the rest behind.",
        summary:
          "Give it 1-3, 8, 12-15 and it returns one document containing exactly those pages, in order.",
        keywords: ["select pages", "pick pages", "keep pages", "subset", "page range"],
        isNew: true,
      },
      {
        name: "Remove Pages",
        slug: "remove-pages",
        description: "Delete specific pages from a PDF and keep everything else untouched.",
        summary:
          "The inverse of extract — name the pages to drop and the rest is re-assembled in order.",
        keywords: ["delete pages", "drop pages", "erase", "blank pages", "cut pages"],
        isNew: true,
      },
      {
        name: "Word to PDF",
        slug: "word-to-pdf",
        description: "Turn a .docx Word document into a PDF, keeping headings, lists, tables and images.",
        summary:
          "Reads the document's structure in the browser and typesets it onto pages — a clean re-flow, not a photocopy.",
        keywords: ["docx to pdf", "doc to pdf", "word", "docx", "convert word", "cv to pdf", "resume"],
        isNew: true,
      },
      {
        name: "TXT to PDF",
        slug: "txt-to-pdf",
        description: "Turn a plain text, log or Markdown file into a clean, paginated PDF.",
        summary:
          "Wraps and paginates your text, with a choice between reflowing paragraphs and keeping every line.",
        keywords: ["text to pdf", "txt", "log to pdf", "notepad", "markdown to pdf", "md"],
        isNew: true,
      },
      {
        name: "RTF to PDF",
        slug: "rtf-to-pdf",
        description: "Convert a Rich Text Format document to PDF, keeping paragraphs and formatting.",
        summary:
          "Reads RTF's control language directly in the browser — no conversion service involved.",
        keywords: ["rich text", "rtf", "wordpad", "textedit", "convert rtf"],
        isNew: true,
      },
      {
        name: "HTML to PDF",
        slug: "html-to-pdf",
        description: "Convert a saved HTML file into a readable PDF with working links.",
        summary:
          "Typesets the document's structure — headings, lists, tables, code — without fetching anything remote.",
        keywords: ["html", "htm", "webpage to pdf", "web page", "markup"],
        isNew: true,
      },
      {
        name: "ODT to PDF",
        slug: "odt-to-pdf",
        description: "Convert a LibreOffice or OpenOffice document into a PDF.",
        summary:
          "Unzips the OpenDocument archive and typesets its XML — headings, lists and tables included.",
        keywords: ["opendocument", "libreoffice", "openoffice", "odt", "open office"],
        isNew: true,
      },
      {
        name: "EPUB to PDF",
        slug: "epub-to-pdf",
        description: "Convert an EPUB ebook into a paginated PDF, chapter by chapter.",
        summary:
          "Follows the book's own spine order so chapters come out in the order they are meant to be read.",
        keywords: ["ebook", "epub", "book to pdf", "kindle", "reader"],
        isNew: true,
      },
      {
        name: "Excel to PDF",
        slug: "excel-to-pdf",
        description: "Turn an Excel workbook into a PDF table, with every sheet and dates handled properly.",
        summary:
          "Reads the .xlsx XML directly, converts Excel's serial dates back to real dates, and lays each sheet out as a table.",
        keywords: ["xlsx to pdf", "spreadsheet", "excel", "xls", "sheet to pdf", "workbook"],
        isNew: true,
      },
      {
        name: "HWP to PDF",
        slug: "hwp-to-pdf",
        description: "Convert a Hangul Word Processor .hwpx document into a PDF.",
        summary:
          "Reads the OWPML zip directly. Korean glyphs can't be drawn by the standard PDF fonts — the tool says so up front.",
        keywords: ["hwpx", "hangul", "korean", "hancom", "hwp"],
        isNew: true,
      },
      {
        name: "PPT to PDF",
        slug: "ppt-to-pdf",
        description: "Turn a PowerPoint deck into a readable PDF — titles, bullets and speaker notes.",
        summary:
          "Reads the slide XML in presentation order and lays each slide out as a page of text.",
        keywords: ["pptx to pdf", "powerpoint", "slides", "deck", "presentation", "speaker notes"],
        isNew: true,
      },
      {
        name: "PDF to PPT",
        slug: "pdf-to-ppt",
        description: "Turn each page of a PDF into a PowerPoint slide you can present.",
        summary:
          "Renders every page onto its own slide, sized to your page shape so nothing is letterboxed.",
        keywords: ["pdf to pptx", "powerpoint", "slides", "present", "deck", "projector"],
        isNew: true,
      },
      {
        name: "PDF to Excel",
        slug: "pdf-to-excel",
        description: "Pull the tables out of a PDF into an editable Excel workbook.",
        summary:
          "Reconstructs columns from where text sits on the page, and writes numbers as numbers so they sum.",
        keywords: ["pdf to xlsx", "extract table", "bank statement", "invoice", "spreadsheet", "tables"],
        isNew: true,
      },
      {
        name: "PDF Scanner",
        slug: "scanner",
        description: "Scan pages to PDF with your phone or webcam — no app, nothing uploaded.",
        summary:
          "Captures from the camera and cleans each page up for legibility, then assembles the PDF on your device.",
        keywords: ["scan", "camera", "phone scanner", "document scanner", "photo to pdf", "receipt"],
        isNew: true,
      },
      {
        name: "Edit PDF",
        slug: "edit-pdf",
        description: "Add text to a PDF, white out mistakes, and draw boxes or highlights.",
        summary:
          "Everything is drawn on top as vectors, so the document keeps its text layer and stays searchable.",
        keywords: ["edit", "add text", "white out", "correct", "change pdf", "write on pdf"],
        isNew: true,
      },
      {
        name: "PDF Annotator",
        slug: "annotate-pdf",
        description: "Highlight text, draw with a pen and add notes to any PDF.",
        summary:
          "Marks are written into the page itself, so they travel with the file rather than being toggleable comments.",
        keywords: ["highlight", "annotate", "markup", "review", "comment", "draw on pdf", "pen"],
        isNew: true,
      },
      {
        name: "Redact PDF",
        slug: "redact-pdf",
        description: "Black out text so it is actually removed from the file, not just covered over.",
        summary:
          "Rebuilds each page as an image, so redacted content cannot be selected, copied or extracted afterwards.",
        keywords: ["redact", "black out", "censor", "remove text", "hide", "sensitive", "gdpr"],
        isNew: true,
      },
      {
        name: "PDF Form Filler",
        slug: "fill-form",
        description: "Fill in a fillable PDF form and save it, even if your reader can't.",
        summary:
          "Reads the form's real fields, writes your answers back, and regenerates appearances so it prints correctly.",
        keywords: ["fill form", "fillable", "acroform", "application form", "type in pdf", "form"],
        isNew: true,
      },
      {
        name: "Flatten PDF",
        slug: "flatten-pdf",
        description: "Bake a filled-in form's values into the page so they can't be edited or lost.",
        summary:
          "Turns live form fields into ordinary page content — the fix for a form that prints blank.",
        keywords: ["form", "flatten", "print blank", "acroform", "finalize", "uneditable"],
        isNew: true,
      },
      {
        name: "PDF to Word",
        slug: "pdf-to-word",
        description: "Convert a PDF into an editable Word document, with paragraphs and headings rebuilt.",
        summary:
          "Reads the text layer, infers paragraphs, headings and lists, and writes a real .docx — no OCR, no upload.",
        keywords: ["pdf to docx", "pdf to doc", "editable", "convert pdf", "word", "docx", "edit pdf"],
        isNew: true,
      },
      {
        name: "PDF to Text",
        slug: "pdf-to-text",
        description: "Pull the text out of a PDF as plain text or Markdown, ready to paste anywhere.",
        summary:
          "Extracts the real text layer with pdf.js — no OCR, so it works on digital PDFs, not scans.",
        keywords: ["extract text", "copy text", "txt", "markdown", "plain text", "transcript"],
        isNew: true,
      },
    ],
  },
  {
    label: "Video",
    slug: "video",
    description:
      "Trim, convert, and mute video without an upload. Powered by a WebAssembly build of FFmpeg running inside the tab — slower than native, but nothing leaves your machine.",
    colorClass: "text-video",
    subtleClass: "bg-video-subtle",
    tools: [
      {
        name: "Video Trimmer",
        slug: "trimmer",
        description: "Cut a clip out of a video by start and end time, without re-encoding.",
        summary:
          "Stream copy keeps the original quality and finishes in seconds rather than minutes.",
        keywords: ["cut", "clip", "shorten", "trim video", "split video"],
      },
      {
        name: "Mute Video",
        slug: "mute",
        description: "Strip the audio track from a video and keep the picture untouched.",
        summary:
          "Drops the audio stream and copies the video stream verbatim — near-instant, no quality loss.",
        keywords: ["remove audio", "silence", "strip sound", "no sound", "mute"],
      },
      {
        name: "Video to GIF",
        slug: "to-gif",
        description: "Turn a section of video into an animated GIF with a custom size and frame rate.",
        summary:
          "Builds an optimised palette first, so colors hold up instead of banding.",
        keywords: ["mp4 to gif", "animated gif", "meme", "loop", "webm to gif"],
      },
      {
        name: "Video Converter",
        slug: "converter",
        description: "Convert between MP4, WebM, and MKV. Re-encodes, so expect it to take a while.",
        summary:
          "Full H.264 or VP9 re-encode with a quality slider. Minutes, not seconds — the tool says so up front.",
        keywords: ["mp4", "webm", "mkv", "mov to mp4", "avi", "transcode", "format"],
      },
      {
        name: "Compress Video",
        slug: "compress",
        description: "Shrink a video's file size with a quality target you control.",
        summary:
          "Re-encodes at a chosen CRF — the same knob professional encoders use — and reports what you saved.",
        keywords: ["reduce size", "smaller", "shrink", "whatsapp", "email", "upload limit"],
        isNew: true,
      },
      {
        name: "Merge Video",
        slug: "merge",
        description: "Join several videos end to end into one file.",
        summary:
          "Concatenates clips in the order you arrange them, re-encoding so mismatched sources still line up.",
        keywords: ["join", "combine", "append", "stitch", "concatenate clips"],
        isNew: true,
      },
      {
        name: "Video Speed",
        slug: "speed",
        description: "Make a video play faster or slower, keeping the audio in sync.",
        summary:
          "Adjusts presentation timestamps and audio tempo together, so a 2× clip still sounds right.",
        keywords: ["slow motion", "timelapse", "fast forward", "slomo", "tempo"],
        isNew: true,
      },
      {
        name: "Extract Frames",
        slug: "extract-frames",
        description: "Save frames from a video as images — every frame, or one every few seconds.",
        summary:
          "Pulls PNG or JPG stills at the interval you pick and bundles them into a ZIP.",
        keywords: ["screenshot", "stills", "thumbnail", "frame grab", "video to images"],
        isNew: true,
      },
    ],
  },
];

// Trailing slashes for the same reason as toolHref — `trailingSlash: true`
// turns "/legal/contact" into a 308 on every click.
export const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/legal/privacy-policy/" },
  { label: "Terms of Use", href: "/legal/terms-of-use/" },
  { label: "Contact", href: "/legal/contact/" },
];

/**
 * Standalone pages that are neither a tool nor a legal notice. Listed here so
 * the footer and the sitemap read from one place — a page linked in the footer
 * but missing from the sitemap is the usual way a route ends up uncrawled.
 */
export const SITE_PAGES = [{ label: "About us", href: "/about/" }];

/**
 * Hrefs carry a trailing slash because next.config sets `trailingSlash: true`.
 * Without it every nav link, card and related-tool link resolves through a 308
 * redirect — invisible in the browser, but crawlers spend budget on it and
 * internal link equity passes through a hop it does not need to.
 */
export function toolHref(categorySlug: string, toolSlug: string): string {
  return `/${categorySlug}/${toolSlug}/`;
}

export function categoryHref(categorySlug: string): string {
  return `/${categorySlug}/`;
}

/** Every tool route, flattened — used by the sitemap. */
export function allToolHrefs(): string[] {
  return TOOL_CATEGORIES.flatMap((category) =>
    category.tools.map((tool) => toolHref(category.slug, tool.slug))
  );
}

export function findCategory(slug: string): ToolCategory | undefined {
  return TOOL_CATEGORIES.find((category) => category.slug === slug);
}

/**
 * Every tool, flattened and carrying its category. Search, the mega-menu and
 * the related-tools rail all want a flat list rather than a nested one.
 */
export const ALL_TOOLS: ToolWithCategory[] = TOOL_CATEGORIES.flatMap((category) =>
  category.tools.map((tool) => ({
    ...tool,
    category,
    href: toolHref(category.slug, tool.slug),
  }))
);

export const TOOL_COUNT = ALL_TOOLS.length;

export function findTool(categorySlug: string, toolSlug: string): ToolWithCategory | undefined {
  return ALL_TOOLS.find((t) => t.category.slug === categorySlug && t.slug === toolSlug);
}

/**
 * Ranked substring search over name, description, summary and keywords.
 *
 * Deliberately not fuzzy. On a 37-tool corpus a typo-tolerant matcher mostly
 * produces confident nonsense — "pdf" scoring a hit on "Photo Filters" — and
 * the ranking below (name-prefix beats name-contains beats keyword beats
 * description) already puts the obvious answer first for every query the tool
 * names actually support.
 */
export function searchTools(query: string, limit = 8): ToolWithCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { tool: ToolWithCategory; score: number }[] = [];

  for (const tool of ALL_TOOLS) {
    const name = tool.name.toLowerCase();
    let score = 0;

    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (tool.keywords?.some((k) => k.toLowerCase().startsWith(q))) score = 45;
    else if (tool.keywords?.some((k) => k.toLowerCase().includes(q))) score = 35;
    else if (tool.category.label.toLowerCase().startsWith(q)) score = 25;
    else if (tool.description.toLowerCase().includes(q)) score = 15;
    else if (tool.summary.toLowerCase().includes(q)) score = 10;

    if (score > 0) scored.push({ tool, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, limit)
    .map((s) => s.tool);
}

/**
 * The tools people actually reach for, most-wanted first, per category.
 *
 * Ordered by search demand for the job the tool does — "pdf to word", "merge
 * pdf", "compress image", "mp4 to mp3" and the like are an order of magnitude
 * more searched than "flatten pdf" or "reverse audio". It is a hand-kept
 * editorial ranking rather than measured analytics, because nothing here phones
 * home: there is no server to count clicks with, and adding one to rank a grid
 * would break the promise the whole site is built on.
 *
 * Slugs not listed keep their registry order, appended after the ranked ones,
 * so adding a tool never requires touching this list — it just lands below the
 * headliners until someone decides it belongs among them.
 */
export const POPULAR_TOOLS: Record<string, string[]> = {
  audio: ["video-to-mp3", "converter", "audio-cutter", "merge"],
  image: ["compressor", "resizer", "converter", "cropper"],
  pdf: ["pdf-to-word", "word-to-pdf", "merge-pdf", "compress-pdf", "ppt-to-pdf", "excel-to-pdf", "split-pdf", "pdf-to-images"],
  video: ["compress", "converter", "trimmer", "to-gif"],
};

/**
 * Sort a category's tools so the ranked ones lead. Stable for the rest: a tool
 * missing from POPULAR_TOOLS keeps its position relative to the other unranked
 * tools rather than being shuffled to an arbitrary spot.
 */
export function popularFirst(tools: ToolWithCategory[]): ToolWithCategory[] {
  const rank = (tool: ToolWithCategory) => {
    const index = POPULAR_TOOLS[tool.category.slug]?.indexOf(tool.slug) ?? -1;
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return tools
    .map((tool, i) => ({ tool, i }))
    .sort((a, b) => rank(a.tool) - rank(b.tool) || a.i - b.i)
    .map((entry) => entry.tool);
}

/**
 * Tools to suggest at the bottom of a tool page.
 *
 * Same-category siblings first — someone who just merged a PDF is far more
 * likely to want to compress it than to resize a JPEG — then anything sharing
 * a keyword, which is what connects "Compress Image" to "Compress PDF" across
 * the category boundary. Both halves are internal links Google will follow,
 * so this is doing SEO work as well as UX work.
 */
export function relatedTools(
  categorySlug: string,
  toolSlug: string,
  limit = 6
): ToolWithCategory[] {
  const current = findTool(categorySlug, toolSlug);
  if (!current) return ALL_TOOLS.slice(0, limit);

  const currentKeywords = new Set((current.keywords ?? []).map((k) => k.toLowerCase()));

  const siblings = ALL_TOOLS.filter(
    (t) => t.category.slug === categorySlug && t.slug !== toolSlug
  );

  const crossCategory = ALL_TOOLS.filter(
    (t) =>
      t.category.slug !== categorySlug &&
      (t.keywords ?? []).some((k) => currentKeywords.has(k.toLowerCase()))
  );

  // Interleave so the rail never turns into six of the same category when a
  // cross-category match exists.
  const picked: ToolWithCategory[] = [];
  const seen = new Set<string>();
  for (const tool of [...crossCategory.slice(0, 2), ...siblings, ...crossCategory]) {
    if (picked.length >= limit) break;
    if (seen.has(tool.href)) continue;
    seen.add(tool.href);
    picked.push(tool);
  }

  return picked;
}
