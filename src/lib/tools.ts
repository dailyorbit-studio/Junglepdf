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
        description: "Convert to JPG, PNG, WebP, GIF, BMP, TIFF or ICO without changing dimensions.",
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
  {
    label: "Developer",
    slug: "dev",
    description:
      "Decode, format, and generate the things developers reach for a dozen times a day. Every tool runs on your device — paste a token or a query and nothing is sent anywhere.",
    colorClass: "text-dev",
    subtleClass: "bg-dev-subtle",
    tools: [
      {
        name: "JWT Decoder",
        slug: "jwt-decoder",
        description: "Decode a JSON Web Token to read its header and payload, and check when it expires.",
        summary:
          "Splits and base64url-decodes the token in your browser — the secret is never needed and nothing is transmitted.",
        keywords: ["jwt", "json web token", "decode token", "bearer", "auth", "claims", "payload"],
        isNew: true,
      },
      {
        name: "UUID Generator",
        slug: "uuid-generator",
        description: "Generate random v4 UUIDs one at a time or in bulk, ready to copy.",
        summary:
          "Uses the browser's crypto.randomUUID for real cryptographic randomness — generate up to hundreds at once.",
        keywords: ["uuid", "guid", "unique id", "v4", "random id", "identifier"],
        isNew: true,
      },
      {
        name: "JSON Formatter",
        slug: "json-formatter",
        description: "Pretty-print messy JSON with proper indentation, or minify it back to one line.",
        summary:
          "Parses and re-serializes with your chosen indent, reporting the exact position of any syntax error.",
        keywords: ["json", "pretty print", "beautify", "format json", "minify", "indent"],
        isNew: true,
      },
      {
        name: "JSON Validator",
        slug: "json-validator",
        description: "Check whether a block of JSON is valid and get the line and column of the first error.",
        summary:
          "Runs a strict parse and points at the exact character where the document breaks, with a plain-English reason.",
        keywords: ["json", "validate json", "json lint", "syntax check", "is valid json"],
        isNew: true,
      },
      {
        name: "SQL Formatter",
        slug: "sql-formatter",
        description: "Format a cramped SQL query into readable, indented lines with keywords aligned.",
        summary:
          "Re-lays clauses onto their own lines and normalises keyword case, entirely in the browser.",
        keywords: ["sql", "format sql", "beautify sql", "query formatter", "pretty sql", "indent"],
        isNew: true,
      },
      {
        name: "HTML Formatter",
        slug: "html-formatter",
        description: "Indent and tidy raw HTML so nested tags are readable, or collapse it back down.",
        summary:
          "Re-indents the markup by tag depth and can minify it again — your HTML never leaves the page.",
        keywords: ["html", "format html", "beautify html", "pretty print", "indent html", "minify"],
        isNew: true,
      },
      {
        name: "CSS Beautifier",
        slug: "css-beautifier",
        description: "Format minified or messy CSS into clean, indented rules — or minify it for shipping.",
        summary:
          "Splits rules and declarations onto their own lines with consistent spacing, and can compress them back.",
        keywords: ["css", "beautify css", "format css", "pretty css", "minify css", "unminify"],
        isNew: true,
      },
      {
        name: "Base64 Encode/Decode",
        slug: "base64",
        description: "Convert text to Base64 and back, with full Unicode handled correctly.",
        summary:
          "Encodes and decodes through a UTF-8-safe path so emoji and accents survive the round trip.",
        keywords: ["base64", "encode", "decode", "b64", "atob", "btoa", "data uri"],
        isNew: true,
      },
      {
        name: "URL Encode/Decode",
        slug: "url-encoder",
        description: "Percent-encode text for safe use in URLs, or decode an encoded string back to plain text.",
        summary:
          "Runs encodeURIComponent and decodeURIComponent in the browser, with a component and full-URL mode.",
        keywords: ["url encode", "url decode", "percent encode", "uri", "escape", "querystring"],
        isNew: true,
      },
      {
        name: "Regex Tester",
        slug: "regex-tester",
        description: "Test a regular expression against your text and see every match highlighted live.",
        summary:
          "Runs the pattern with the flags you set and lists each match and capture group as you type.",
        keywords: ["regex", "regular expression", "regexp", "test regex", "match", "pattern", "capture group"],
        isNew: true,
      },
      {
        name: "Hash Generator",
        slug: "hash-generator",
        description: "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text.",
        summary:
          "Uses the browser's Web Crypto SubtleCrypto for real hashing — the input never leaves your device.",
        keywords: ["hash", "sha256", "sha-256", "sha1", "sha512", "checksum", "digest"],
        isNew: true,
      },
      {
        name: "Timestamp Converter",
        slug: "timestamp-converter",
        description: "Convert a Unix timestamp to a human date and back, in your local time and UTC.",
        summary:
          "Reads seconds or milliseconds and shows the date in UTC and your local zone, updating as you type.",
        keywords: ["unix timestamp", "epoch", "unix time", "date to timestamp", "utc", "milliseconds"],
        isNew: true,
      },
    ],
  },
  {
    label: "Text",
    slug: "text",
    description:
      "Clean up, transform, and count text without leaving the page. Sort lines, strip duplicates, change case, generate slugs — every tool runs on your device as you type.",
    colorClass: "text-txt",
    subtleClass: "bg-txt-subtle",
    tools: [
      {
        name: "Remove Duplicate Lines",
        slug: "remove-duplicate-lines",
        description: "Remove repeated lines from a list, keeping the first of each.",
        summary:
          "Deduplicates line by line, with optional case-insensitive and trimmed matching.",
        keywords: ["dedupe", "duplicate lines", "unique lines", "remove repeats", "distinct"],
        isNew: true,
      },
      {
        name: "Remove Blank Lines",
        slug: "remove-blank-lines",
        description: "Strip empty and whitespace-only lines from a block of text.",
        summary:
          "Drops blank lines and can trim trailing spaces on the ones that remain.",
        keywords: ["empty lines", "blank lines", "remove whitespace", "compact", "clean text"],
        isNew: true,
      },
      {
        name: "Alphabetical Sort",
        slug: "sort-text",
        description: "Sort lines alphabetically, A→Z or Z→A, with numeric and case options.",
        summary:
          "Orders lines with optional case-insensitive, numeric, and de-duplicate handling.",
        keywords: ["alphabetical sort", "sort lines", "order list", "a-z", "sort text"],
        isNew: true,
      },
      {
        name: "Reverse Text",
        slug: "reverse-text",
        description: "Reverse text by characters, or flip the order of the words or lines.",
        summary:
          "Reverses characters by default, with separate word-order and line-order modes.",
        keywords: ["reverse", "backwards", "flip text", "mirror", "reverse words"],
        isNew: true,
      },
      {
        name: "Random Text Generator",
        slug: "random-text",
        description: "Generate lorem ipsum or random placeholder text by words, sentences or paragraphs.",
        summary:
          "Builds filler text to the length you choose — handy for mockups and layout tests.",
        keywords: ["lorem ipsum", "placeholder text", "dummy text", "filler", "random words"],
        isNew: true,
      },
      {
        name: "Word Counter",
        slug: "word-counter",
        description: "Count words, characters, sentences and paragraphs as you type.",
        summary:
          "Live counts of words, characters, sentences, paragraphs, plus an estimated reading time.",
        keywords: ["word count", "count words", "essay length", "reading time", "wordcount"],
        isNew: true,
      },
      {
        name: "Character Counter",
        slug: "character-counter",
        description: "Count characters with and without spaces, live as you type.",
        summary:
          "Character, word and line tallies with running counts against common length limits.",
        keywords: ["character count", "letter count", "sms length", "twitter limit", "char counter"],
        isNew: true,
      },
      {
        name: "Case Converter",
        slug: "case-converter",
        description: "Convert text between UPPERCASE, lowercase, Title Case, camelCase and more.",
        summary:
          "One click switches between upper, lower, title, sentence, camel, snake and kebab case.",
        keywords: ["uppercase", "lowercase", "title case", "camelcase", "snake case", "capitalize"],
        isNew: true,
      },
      {
        name: "Slug Generator",
        slug: "slug-generator",
        description: "Turn any title into a clean, URL-safe slug.",
        summary:
          "Lowercases, strips accents and punctuation, and joins the words with hyphens.",
        keywords: ["slug", "url slug", "permalink", "seo url", "kebab case"],
        isNew: true,
      },
      {
        name: "HTML Entity Encoder",
        slug: "html-entities",
        description: "Encode text to HTML entities to display it safely, or decode entities back.",
        summary:
          "Escapes the reserved HTML characters to entities and decodes them again, in the browser.",
        keywords: ["html entities", "escape html", "encode entities", "special characters", "ampersand"],
        isNew: true,
      },
      {
        name: "Morse Code Converter",
        slug: "morse-code",
        description: "Translate text to Morse code and Morse code back to text.",
        summary:
          "Encodes letters, numbers and punctuation to Morse, and decodes dots and dashes back.",
        keywords: ["morse code", "translate morse", "dot dash", "sos", "morse translator"],
        isNew: true,
      },
      {
        name: "Binary ↔ Text",
        slug: "binary-text",
        description: "Convert text to binary and binary back to readable text.",
        summary:
          "Encodes each character to 8-bit binary and decodes it back, UTF-8 aware throughout.",
        keywords: ["binary", "text to binary", "binary to text", "binary translator", "ascii binary"],
        isNew: true,
      },
    ],
  },
  {
    label: "Calculators",
    slug: "calc",
    description:
      "Work out loans, investments, tax and dates in seconds. Every calculator runs on your device — enter your numbers and nothing is sent anywhere.",
    colorClass: "text-calc",
    subtleClass: "bg-calc-subtle",
    tools: [
      {
        name: "EMI Calculator",
        slug: "emi-calculator",
        description: "Work out the monthly EMI on a loan from the amount, interest rate and tenure.",
        summary:
          "Computes the equated monthly instalment plus total interest and total payable, with a full breakdown.",
        keywords: ["emi", "loan emi", "monthly instalment", "home loan", "car loan", "interest"],
        isNew: true,
      },
      {
        name: "SIP Calculator",
        slug: "sip-calculator",
        description: "Estimate the future value of a monthly SIP from the amount, return and duration.",
        summary:
          "Projects the maturity value of a systematic investment plan and shows how much is growth.",
        keywords: ["sip", "mutual fund", "systematic investment", "returns", "wealth", "compounding"],
        isNew: true,
      },
      {
        name: "FD Calculator",
        slug: "fd-calculator",
        description: "Calculate the maturity amount and interest on a fixed deposit.",
        summary:
          "Applies compound interest at your chosen frequency to show the maturity value and interest earned.",
        keywords: ["fixed deposit", "fd", "maturity", "compound interest", "bank deposit", "returns"],
        isNew: true,
      },
      {
        name: "GST Calculator",
        slug: "gst-calculator",
        description: "Add or remove GST at any rate, with the tax split into CGST and SGST.",
        summary:
          "Works out the tax and net or gross amount either way, splitting GST into CGST and SGST halves.",
        keywords: ["gst", "tax", "cgst", "sgst", "add gst", "remove gst", "inclusive", "exclusive"],
        isNew: true,
      },
      {
        name: "Loan Calculator",
        slug: "loan-calculator",
        description: "See the monthly payment, total interest and total cost of any loan.",
        summary:
          "Amortises a loan from principal, rate and term to show the payment and the lifetime interest.",
        keywords: ["loan", "repayment", "interest", "personal loan", "mortgage", "amortization"],
        isNew: true,
      },
      {
        name: "Salary Calculator",
        slug: "salary-calculator",
        description: "Break a yearly salary down to monthly, weekly, daily and hourly pay.",
        summary:
          "Converts an annual figure across pay periods using your working hours, before deductions.",
        keywords: ["salary", "hourly rate", "annual to hourly", "pay", "wage", "take home"],
        isNew: true,
      },
      {
        name: "Percentage Calculator",
        slug: "percentage-calculator",
        description: "Solve the common percentage questions — of, change, and what-percent.",
        summary:
          "Three calculators in one: X% of Y, X is what percent of Y, and the percentage increase or decrease.",
        keywords: ["percentage", "percent of", "percent change", "increase", "decrease", "ratio"],
        isNew: true,
      },
      {
        name: "Age Calculator",
        slug: "age-calculator",
        description: "Work out an exact age in years, months and days from a date of birth.",
        summary:
          "Counts the precise years, months and days to today or any date, plus the total days lived.",
        keywords: ["age", "date of birth", "how old", "birthday", "years months days"],
        isNew: true,
      },
      {
        name: "Date Difference",
        slug: "date-difference",
        description: "Count the days, weeks and months between two dates.",
        summary:
          "Gives the exact gap between two dates in days, and in years, months and days combined.",
        keywords: ["date difference", "days between", "duration", "how many days", "date calculator"],
        isNew: true,
      },
      {
        name: "Time Duration",
        slug: "time-duration",
        description: "Calculate the duration between a start and end time.",
        summary:
          "Works out hours and minutes between two times, handling spans that cross midnight.",
        keywords: ["time duration", "hours between", "time difference", "elapsed", "shift length"],
        isNew: true,
      },
      {
        name: "Discount Calculator",
        slug: "discount-calculator",
        description: "Find the sale price and the amount saved from a price and a discount.",
        summary:
          "Applies a percentage off to show the final price and the money saved, instantly.",
        keywords: ["discount", "sale price", "percent off", "savings", "markdown", "deal"],
        isNew: true,
      },
    ],
  },
  {
    label: "CSS",
    slug: "css",
    description:
      "Design CSS visually and copy the code. Tune the sliders, watch the live preview, and paste the result — every generator runs in your browser.",
    colorClass: "text-css",
    subtleClass: "bg-css-subtle",
    tools: [
      {
        name: "Glassmorphism Generator",
        slug: "glassmorphism",
        description: "Design a frosted-glass card and copy the CSS, backdrop-blur and all.",
        summary:
          "Tune blur, transparency and tint with a live preview, then copy the backdrop-filter CSS.",
        keywords: ["glassmorphism", "frosted glass", "backdrop filter", "blur", "glass card", "css"],
        isNew: true,
      },
      {
        name: "Neumorphism Generator",
        slug: "neumorphism",
        description: "Create soft, extruded neumorphic shadows and copy the CSS.",
        summary:
          "Adjust distance, blur and intensity to build the paired light and dark shadows, with a live preview.",
        keywords: ["neumorphism", "soft ui", "box shadow", "extruded", "css", "neomorphism"],
        isNew: true,
      },
      {
        name: "Border Radius Generator",
        slug: "border-radius",
        description: "Round corners individually and copy the border-radius CSS.",
        summary:
          "Drag each corner independently to shape a box, with the border-radius value updating live.",
        keywords: ["border radius", "rounded corners", "css", "blob", "corner radius"],
        isNew: true,
      },
      {
        name: "Box Shadow Generator",
        slug: "box-shadow",
        description: "Build a box-shadow with offset, blur, spread and colour, and copy the CSS.",
        summary:
          "Control every shadow parameter, inset included, and copy the box-shadow with a live preview.",
        keywords: ["box shadow", "css shadow", "drop shadow", "inset", "elevation"],
        isNew: true,
      },
      {
        name: "Gradient Generator",
        slug: "gradient",
        description: "Design a linear or radial CSS gradient and copy the background.",
        summary:
          "Pick colours and an angle, switch between linear and radial, and copy the gradient CSS.",
        keywords: ["gradient", "linear gradient", "radial gradient", "css background", "colours"],
        isNew: true,
      },
      {
        name: "Clip Path Generator",
        slug: "clip-path",
        description: "Choose a shape and copy the CSS clip-path that cuts a box to it.",
        summary:
          "Preset polygons — triangles, hexagons, arrows and more — previewed live with the clip-path CSS.",
        keywords: ["clip path", "css shapes", "polygon", "mask", "clip", "cut out"],
        isNew: true,
      },
      {
        name: "CSS Grid Generator",
        slug: "grid",
        description: "Set up columns, rows and gaps visually and copy the grid CSS.",
        summary:
          "Adjust the column and row counts and the gap, preview the tracks, and copy the grid CSS.",
        keywords: ["css grid", "grid template", "columns", "layout", "grid generator"],
        isNew: true,
      },
      {
        name: "Flexbox Generator",
        slug: "flexbox",
        description: "Experiment with flex alignment and copy the flexbox CSS.",
        summary:
          "Change direction, justify, align, wrap and gap on a live row of items, and copy the flex CSS.",
        keywords: ["flexbox", "flex", "justify content", "align items", "css layout", "flex generator"],
        isNew: true,
      },
    ],
  },
  {
    label: "SEO",
    slug: "seo",
    description:
      "Generate the tags and files search engines look for — meta tags, Open Graph, robots.txt, sitemaps and structured data. Fill the form, copy the code, all in your browser.",
    colorClass: "text-seo",
    subtleClass: "bg-seo-subtle",
    tools: [
      {
        name: "Meta Tag Generator",
        slug: "meta-tags",
        description: "Generate the title, description and meta tags a page needs, ready to paste.",
        summary:
          "Builds the title, description, robots, viewport and charset tags from a short form.",
        keywords: ["meta tags", "meta description", "title tag", "seo tags", "head tags", "generator"],
        isNew: true,
      },
      {
        name: "Robots.txt Generator",
        slug: "robots-txt",
        description: "Build a robots.txt file with allow, disallow and sitemap directives.",
        summary:
          "Writes a valid robots.txt from your allow and disallow paths and sitemap URL.",
        keywords: ["robots.txt", "crawl", "disallow", "user-agent", "block crawler", "generator"],
        isNew: true,
      },
      {
        name: "Sitemap Generator",
        slug: "sitemap",
        description: "Turn a list of URLs into a valid XML sitemap for search engines.",
        summary:
          "Wraps your URLs in sitemap XML with changefreq and priority, ready to upload.",
        keywords: ["sitemap", "xml sitemap", "sitemap.xml", "urls", "search console", "generator"],
        isNew: true,
      },
      {
        name: "Open Graph Generator",
        slug: "open-graph",
        description: "Generate Open Graph meta tags for rich link previews on social media.",
        summary:
          "Builds the og:title, og:description, og:image, og:url and og:type tags from a form.",
        keywords: ["open graph", "og tags", "facebook preview", "social meta", "link preview", "og:image"],
        isNew: true,
      },
      {
        name: "Twitter Card Generator",
        slug: "twitter-card",
        description: "Generate Twitter Card meta tags for rich previews on X / Twitter.",
        summary:
          "Writes the twitter:card, title, description, image and site tags for summary or large-image cards.",
        keywords: ["twitter card", "x card", "twitter meta", "summary large image", "social preview"],
        isNew: true,
      },
      {
        name: "Canonical URL Generator",
        slug: "canonical",
        description: "Generate a canonical link tag to point search engines at the preferred URL.",
        summary:
          "Cleans a URL of tracking parameters and wraps it in a rel=canonical link tag.",
        keywords: ["canonical", "rel canonical", "duplicate content", "canonical url", "link tag"],
        isNew: true,
      },
      {
        name: "Schema Markup Generator",
        slug: "schema",
        description: "Generate JSON-LD structured data for organisations, articles, FAQs and more.",
        summary:
          "Produces valid schema.org JSON-LD for several common types from a short form.",
        keywords: ["schema", "json-ld", "structured data", "rich results", "schema.org", "microdata"],
        isNew: true,
      },
    ],
  },
  {
    label: "QR Codes",
    slug: "qr",
    description:
      "Create QR codes and barcodes for links, WiFi, contacts, payments and more — or scan one with your camera. Everything is generated on your device; nothing is uploaded.",
    colorClass: "text-qr",
    subtleClass: "bg-qr-subtle",
    tools: [
      {
        name: "QR Code Generator",
        slug: "qr-generator",
        description: "Turn any text or link into a QR code and download it as a PNG.",
        summary:
          "Encodes any text or URL into a scannable QR code you can size and download, all in the browser.",
        keywords: ["qr code", "qr generator", "url to qr", "text to qr", "make qr code"],
        isNew: true,
      },
      {
        name: "WiFi QR Code",
        slug: "wifi-qr",
        description: "Make a QR code that connects a phone to your WiFi with one scan.",
        summary:
          "Builds a WIFI: QR from your network name, password and security type — no more reading out passwords.",
        keywords: ["wifi qr", "wifi password qr", "network qr", "guest wifi", "connect wifi"],
        isNew: true,
      },
      {
        name: "WhatsApp QR Code",
        slug: "whatsapp-qr",
        description: "Create a QR code that opens a WhatsApp chat with a prefilled message.",
        summary:
          "Encodes a wa.me link with your number and an optional message, so a scan opens the chat.",
        keywords: ["whatsapp qr", "wa.me", "click to chat", "whatsapp link", "business qr"],
        isNew: true,
      },
      {
        name: "vCard QR Code",
        slug: "vcard-qr",
        description: "Put your contact details into a QR code that saves straight to a phone.",
        summary:
          "Builds a vCard QR from name, phone, email and more, so a scan adds you as a contact.",
        keywords: ["vcard qr", "contact qr", "business card qr", "digital business card", "mecard"],
        isNew: true,
      },
      {
        name: "Email QR Code",
        slug: "email-qr",
        description: "Make a QR code that opens a new email with the address, subject and body filled in.",
        summary:
          "Encodes a mailto link so a scan opens a prefilled email to your address.",
        keywords: ["email qr", "mailto qr", "contact qr", "email link", "qr to email"],
        isNew: true,
      },
      {
        name: "Payment QR Code",
        slug: "payment-qr",
        description: "Generate a UPI payment QR code with your ID, name and an optional amount.",
        summary:
          "Builds a upi:// QR that any UPI app can scan to pay you, with amount and note optional.",
        keywords: ["upi qr", "payment qr", "upi id qr", "collect payment", "scan to pay", "gpay phonepe"],
        isNew: true,
      },
      {
        name: "Scan QR Code",
        slug: "scan-qr",
        description: "Scan a QR code with your camera and read what it contains — no app needed.",
        summary:
          "Reads a QR code from your camera or an image entirely on-device; nothing is uploaded.",
        keywords: ["scan qr", "qr scanner", "qr reader", "read qr code", "camera scanner"],
        isNew: true,
      },
      {
        name: "Barcode Generator",
        slug: "barcode",
        description: "Generate a barcode in CODE128, EAN, UPC and other formats, ready to download.",
        summary:
          "Renders a barcode in the format you pick and lets you download it as a PNG, in the browser.",
        keywords: ["barcode", "code128", "ean13", "upc", "barcode generator", "product code"],
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
 * The six tools the homepage hero links to directly.
 *
 * The hero used to hold a second copy of the nav's search field. It had to go:
 * the hero section is `overflow-hidden` so the CanopyBackdrop's foliage — which
 * is deliberately positioned past the section's edges — cannot spill out and
 * give the page a horizontal scrollbar. That clip also catches the search
 * dropdown, which is an absolutely-positioned descendant, and no z-index can
 * lift a box out of an ancestor's overflow clip. Results were being sliced off
 * at the section boundary.
 *
 * Six direct links are the better answer regardless of the bug. The nav search
 * is present at every breakpoint already (inline from md up, inside the drawer
 * below it), and a link you can see beats a field you have to think of the right
 * word for.
 *
 * Cross-category on purpose: the hero is the one place that has to say "this
 * site does more than PDFs" before you scroll.
 */
const HERO_TOOL_KEYS = [
  "pdf/merge-pdf",
  "pdf/pdf-to-word",
  "image/compressor",
  "audio/video-to-mp3",
  "video/compress",
  "pdf/split-pdf",
] as const;

export const HERO_TOOLS: ToolWithCategory[] = HERO_TOOL_KEYS.map((key) => {
  const [categorySlug, toolSlug] = key.split("/");
  const tool = findTool(categorySlug, toolSlug);
  // Thrown at module scope, so a renamed slug fails the build instead of
  // quietly dropping a link out of the hero where nobody would notice.
  if (!tool) throw new Error(`HERO_TOOL_KEYS references an unknown tool: ${key}`);
  return tool;
});

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
