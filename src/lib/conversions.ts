/**
 * Conversion landing pages — the "X to Y" routes.
 *
 * People do not search for "image converter". They search for "webp to png",
 * "mp4 to mp3", "heic to jpg". Those queries carry the answer inside them, and
 * a generic converter page competes for them badly: its title says "Image
 * Converter", so it matches nothing the searcher typed.
 *
 * Each entry below becomes a real route at /convert/<slug>/ with its own title,
 * description, H1, canonical, FAQ and schema, rendering the underlying tool with
 * the output format already selected. Landing on "WebP to PNG" and finding PNG
 * pre-picked is the whole point — the page answers the exact question asked.
 *
 * Two rules this file exists to enforce:
 *
 *  1. **Only pairs that actually work.** Every `from` is in the relevant tool's
 *     accept list and every `to` is a format we can genuinely write. A page for
 *     "HEIC to JPG" would rank and then fail, which is worse than not ranking:
 *     no browser but Safari decodes HEIC, so it is deliberately absent. Same for
 *     anything → SVG or AVIF, neither of which can be produced here.
 *
 *  2. **Not doorway pages.** Google's term for near-identical pages spun up per
 *     keyword, and it penalises them. Each page's prose is assembled from the
 *     two formats' own descriptions plus the specific consequence of that pair
 *     (alpha flattened, palette reduced to 256, re-encode quality loss), so the
 *     body genuinely differs. That is also simply more useful to read.
 */

export type ConversionKind = "image" | "audio" | "video" | "video-audio" | "gif";

/**
 * Which client component renders the tool on the landing page.
 *
 * Separate from `kind`, which only decides how the pair is grouped in the
 * menu. They stopped lining up once the GIF group gained members driven by
 * three different components: MP4 to GIF is the Video to GIF tool, GIF to MP4
 * and APNG to GIF are the animated converter, and inferring that from the
 * format pair was a growing pile of guesswork.
 */
export type ConversionComponent =
  | "image"
  | "audio"
  | "video"
  | "video-to-mp3"
  | "video-to-gif"
  | "gif-to-mp4"
  | "apng-to-gif";

export interface FormatInfo {
  /** How it is written in a heading — "WebP", not "WEBP". */
  label: string;
  /** Long form for prose. */
  name: string;
  /** One or two sentences on what the format is and where it is used. */
  blurb: string;
  lossy: boolean;
  alpha: boolean;
}

export const FORMAT_INFO: Record<string, FormatInfo> = {
  /* ── image ── */
  jpg: {
    label: "JPG",
    name: "JPEG image",
    blurb:
      "The oldest and most universally supported photo format. Lossy, no transparency, and it degrades a little every time it is re-saved.",
    lossy: true,
    alpha: false,
  },
  png: {
    label: "PNG",
    name: "PNG image",
    blurb:
      "Lossless and transparency-capable. The right answer for screenshots, logos, diagrams and anything with flat colour and hard edges.",
    lossy: false,
    alpha: true,
  },
  webp: {
    label: "WebP",
    name: "WebP image",
    blurb:
      "Google's web format. Roughly 25–35% smaller than an equivalent JPG, supports transparency, and is read by every current browser — but plenty of desktop software still cannot open one.",
    lossy: true,
    alpha: true,
  },
  avif: {
    label: "AVIF",
    name: "AVIF image",
    blurb:
      "A newer format built on the AV1 codec. Compresses harder than WebP and handles wide colour and HDR. Widely readable, but no browser can create one.",
    lossy: true,
    alpha: true,
  },
  gif: {
    label: "GIF",
    name: "GIF image",
    blurb:
      "Limited to a 256-colour palette. Suited to flat graphics, logos and simple animation rather than photographs.",
    lossy: true,
    alpha: true,
  },
  bmp: {
    label: "BMP",
    name: "Windows bitmap",
    blurb:
      "Uncompressed raw pixels. Enormous files, but trivially readable by old Windows software that chokes on anything modern.",
    lossy: false,
    alpha: false,
  },
  tiff: {
    label: "TIFF",
    name: "TIFF image",
    blurb:
      "The standard interchange format for print, scanning and archival work. Written uncompressed here, so expect a large file.",
    lossy: false,
    alpha: false,
  },
  ico: {
    label: "ICO",
    name: "Windows icon",
    blurb:
      "The Windows icon container, still what browsers request at /favicon.ico. Cannot store a side longer than 256 pixels.",
    lossy: false,
    alpha: true,
  },
  jfif: {
    label: "JFIF",
    name: "JFIF image",
    blurb:
      "Not a separate format at all — a JPEG with a different file extension. Windows and some cameras produce it, and plenty of software refuses to open it purely because of the name.",
    lossy: true,
    alpha: false,
  },

  /* ── audio ── */
  mp3: {
    label: "MP3",
    name: "MP3 audio",
    blurb:
      "The format everything plays. Lossy, and the safe choice whenever you do not control what the file gets opened in.",
    lossy: true,
    alpha: false,
  },
  wav: {
    label: "WAV",
    name: "WAV audio",
    blurb:
      "Uncompressed PCM. Large, lossless, and universally accepted by editing software.",
    lossy: false,
    alpha: false,
  },
  ogg: {
    label: "OGG",
    name: "OGG Vorbis audio",
    blurb:
      "Better than MP3 at the same bitrate and entirely unencumbered by patents. Weaker support across Apple devices.",
    lossy: true,
    alpha: false,
  },
  m4a: {
    label: "M4A",
    name: "M4A audio",
    blurb:
      "AAC in an MP4 container — the default across the Apple ecosystem and what most podcast tooling expects.",
    lossy: true,
    alpha: false,
  },
  flac: {
    label: "FLAC",
    name: "FLAC audio",
    blurb:
      "Lossless compression at roughly half the size of WAV, with bit-identical audio. The archival choice.",
    lossy: false,
    alpha: false,
  },
  aac: {
    label: "AAC",
    name: "AAC audio",
    blurb:
      "The successor to MP3, used by YouTube, Apple Music and most streaming. Better quality per bit than MP3.",
    lossy: true,
    alpha: false,
  },
  wma: {
    label: "WMA",
    name: "Windows Media Audio",
    blurb:
      "Microsoft's old audio format. Still turns up in archived rips, and almost nothing outside Windows plays it.",
    lossy: true,
    alpha: false,
  },

  apng: {
    label: "APNG",
    name: "animated PNG",
    blurb:
      "An animated PNG. Keeps full 24-bit colour and real transparency, which GIF cannot, but plenty of older software and chat apps still refuse to display one.",
    lossy: false,
    alpha: true,
  },

  /* ── video ── */
  mp4: {
    label: "MP4",
    name: "MP4 video",
    blurb:
      "H.264 in an MP4 container. Plays on effectively every device made this century, and the right default for sharing.",
    lossy: true,
    alpha: false,
  },
  mov: {
    label: "MOV",
    name: "QuickTime video",
    blurb:
      "Apple's container, and what an iPhone records. Fine on a Mac; frequently rejected by web players and Windows software.",
    lossy: true,
    alpha: false,
  },
  mkv: {
    label: "MKV",
    name: "Matroska video",
    blurb:
      "A flexible container that can hold almost any stream. Popular for archived media, accepted by very few web players.",
    lossy: true,
    alpha: false,
  },
  webm: {
    label: "WebM",
    name: "WebM video",
    blurb:
      "Open and royalty-free, built for the web. Smaller than MP4 at similar quality, and noticeably slower to encode.",
    lossy: true,
    alpha: false,
  },
  avi: {
    label: "AVI",
    name: "AVI video",
    blurb:
      "A container from the 1990s. Still produced by some cameras and screen recorders, and poorly supported on the modern web.",
    lossy: true,
    alpha: false,
  },
  wmv: {
    label: "WMV",
    name: "Windows Media Video",
    blurb:
      "Microsoft's video container. Common in old corporate and training material, and largely unplayable outside Windows.",
    lossy: true,
    alpha: false,
  },
  flv: {
    label: "FLV",
    name: "Flash video",
    blurb:
      "The Flash-era web video container. Flash is gone; the files are not, and almost nothing opens them any more.",
    lossy: true,
    alpha: false,
  },
};

export interface ConversionPair {
  /** URL slug, e.g. "webp-to-png". */
  slug: string;
  from: string;
  to: string;
  kind: ConversionKind;
  component: ConversionComponent;
  /**
   * The value handed to the underlying tool so the output format arrives
   * pre-selected. A MIME type for images, a plain key for audio and video.
   */
  target: string;
  /** The tool page this is a specialised entry point to. */
  toolHref: string;
}

function image(from: string, to: string): ConversionPair {
  const mime: Record<string, string> = {
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    ico: "image/x-icon",
  };
  return {
    slug: `${from}-to-${to}`,
    from,
    to,
    kind: "image",
    component: "image",
    target: mime[to],
    toolHref: "/image/converter/",
  };
}

function audio(from: string, to: string): ConversionPair {
  return {
    slug: `${from}-to-${to}`,
    from,
    to,
    kind: "audio",
    component: "audio",
    target: to,
    toolHref: "/audio/converter/",
  };
}

function video(from: string, to: string): ConversionPair {
  return {
    slug: `${from}-to-${to}`,
    from,
    to,
    kind: "video",
    component: "video",
    target: to,
    toolHref: "/video/converter/",
  };
}

/**
 * Animated image in, and out the other side.
 *
 * Its own kind because neither of these can use the video tools: both gate on
 * reading a duration from a <video> element, and a browser will not load a GIF
 * or an APNG into one. See lib/animated-convert.ts.
 */
function animated(from: string, to: string): ConversionPair {
  return {
    slug: `${from}-to-${to}`,
    from,
    to,
    kind: "gif",
    component: to === "mp4" ? "gif-to-mp4" : "apng-to-gif",
    target: to,
    // These two have their own component, but the article still points at the
    // nearest general-purpose tool for anyone who arrived with a different job.
    toolHref: to === "mp4" ? "/video/converter/" : "/video/to-gif/",
  };
}

/**
 * Video in, GIF out.
 *
 * Goes through the existing Video to GIF tool, which can read the duration of
 * these containers from a <video> element and therefore offers a trim range —
 * the one thing this conversion genuinely needs, since a full-length GIF of a
 * three-minute clip would be hundreds of megabytes.
 */
function videoGif(from: string): ConversionPair {
  return {
    slug: `${from}-to-gif`,
    from,
    to: "gif",
    kind: "gif",
    component: "video-to-gif",
    target: "gif",
    toolHref: "/video/to-gif/",
  };
}

/** Video in, audio out — a different tool from the video converter. */
function videoAudio(from: string): ConversionPair {
  return {
    slug: `${from}-to-mp3`,
    from,
    to: "mp3",
    kind: "video-audio",
    component: "video-to-mp3",
    target: "mp3",
    toolHref: "/audio/video-to-mp3/",
  };
}

/**
 * The curated list.
 *
 * Curated rather than every combination on purpose: 7 image formats crossed
 * with 7 outputs is 42 pages, most of which nobody has ever searched for, and
 * a pile of near-empty pages drags down the ones that matter. These are the
 * pairs people actually type.
 */
export const CONVERSIONS: ConversionPair[] = [
  // ── Image ──
  image("webp", "png"),
  image("webp", "jpg"),
  image("png", "jpg"),
  image("jpg", "png"),
  image("jfif", "jpg"),
  image("jfif", "png"),
  image("avif", "jpg"),
  image("avif", "png"),
  image("gif", "png"),
  image("gif", "jpg"),
  image("bmp", "jpg"),
  image("bmp", "png"),
  image("tiff", "jpg"),
  image("tiff", "png"),
  image("png", "webp"),
  image("jpg", "webp"),
  image("png", "ico"),
  image("jpg", "ico"),
  image("png", "bmp"),
  image("png", "gif"),
  image("png", "tiff"),

  // ── Audio ──
  audio("wav", "mp3"),
  audio("m4a", "mp3"),
  audio("flac", "mp3"),
  audio("ogg", "mp3"),
  audio("aac", "mp3"),
  audio("wma", "mp3"),
  audio("mp3", "wav"),
  audio("mp3", "ogg"),
  audio("mp3", "m4a"),
  audio("wav", "flac"),
  audio("flac", "wav"),
  audio("m4a", "wav"),

  // ── Video → audio ──
  videoAudio("mp4"),
  videoAudio("mov"),
  videoAudio("mkv"),
  videoAudio("webm"),
  videoAudio("avi"),
  videoAudio("wmv"),

  // ── GIF ──
  videoGif("mp4"),
  videoGif("mov"),
  videoGif("webm"),
  videoGif("avi"),
  animated("apng", "gif"),
  animated("gif", "mp4"),

  // ── Video ──
  video("mov", "mp4"),
  video("avi", "mp4"),
  video("mkv", "mp4"),
  video("webm", "mp4"),
  video("wmv", "mp4"),
  video("flv", "mp4"),
  video("mp4", "webm"),
  video("mp4", "mkv"),
];

export function findConversion(slug: string): ConversionPair | undefined {
  return CONVERSIONS.find((c) => c.slug === slug);
}

export function conversionHref(slug: string): string {
  return `/convert/${slug}/`;
}

/**
 * The handful of conversions that earn a permanent footer link on every page.
 *
 * These pages had a real discoverability problem: nothing in the static HTML
 * linked to /convert/ at all. The nav's Convert panel is rendered only while it
 * is open, so those links do not exist in the document until a human clicks —
 * and a crawler does not click. All 53 pages were reachable from the sitemap
 * alone, which gets them indexed but sends them no internal link value and
 * makes them look orphaned.
 *
 * Deliberately a shortlist, not all 53. A footer repeated across 122 pages is
 * boilerplate, and stuffing every conversion into it dilutes the ones that
 * matter while making the footer taller than the pages above it — the same
 * mistake that got 57 tool links removed from here once already.
 */
const FOOTER_CONVERSION_SLUGS = [
  "mp4-to-mp3",
  "webp-to-png",
  "png-to-jpg",
  "jpg-to-png",
  "mp4-to-gif",
  "wav-to-mp3",
  "mov-to-mp4",
  "png-to-ico",
] as const;

export const FOOTER_CONVERSIONS: ConversionPair[] = FOOTER_CONVERSION_SLUGS.map((slug) => {
  const pair = findConversion(slug);
  // Thrown at module scope so a renamed slug fails the build rather than
  // quietly dropping a link out of the footer of every page on the site.
  if (!pair) throw new Error(`FOOTER_CONVERSION_SLUGS references an unknown conversion: ${slug}`);
  return pair;
});

/** "WebP to PNG" — used in headings, nav and link text. */
export function conversionLabel(pair: ConversionPair): string {
  return `${FORMAT_INFO[pair.from].label} to ${FORMAT_INFO[pair.to].label}`;
}

const KIND_GROUPS: Record<ConversionKind, string> = {
  image: "Image",
  audio: "Audio",
  "video-audio": "Video to audio",
  video: "Video",
  gif: "GIF",
};

export interface ConversionGroup {
  label: string;
  kind: ConversionKind;
  items: ConversionPair[];
}

/** Grouped for the nav mega-menu and the /convert/ index. */
export function conversionGroups(): ConversionGroup[] {
  return (Object.keys(KIND_GROUPS) as ConversionKind[]).map((kind) => ({
    kind,
    label: KIND_GROUPS[kind],
    items: CONVERSIONS.filter((c) => c.kind === kind),
  }));
}

/**
 * The consequence of this specific pair, in one sentence, or null when there
 * is nothing worth warning about.
 *
 * This is what stops the pages being interchangeable. "PNG to JPG" losing
 * transparency and "PNG to GIF" losing colour depth are different facts, and
 * the person doing each one needs the one that applies to them.
 */
export function conversionCaveat(pair: ConversionPair): string | null {
  const from = FORMAT_INFO[pair.from];
  const to = FORMAT_INFO[pair.to];

  if (pair.kind === "image") {
    if (from.alpha && !to.alpha) {
      return `${from.label} can store transparency and ${to.label} cannot, so any transparent areas are filled with white before encoding. Without that step they would come out black.`;
    }
    if (pair.to === "gif") {
      return `GIF holds at most 256 colours, so the palette is rebuilt from your image. Flat graphics survive this well; photographs and gradients will band.`;
    }
    if (pair.to === "ico") {
      return `ICO cannot store a side longer than 256 pixels, so anything larger is scaled down to fit and the tool tells you the size it used.`;
    }
    if (!from.lossy && to.lossy) {
      return `${to.label} is lossy, so this conversion discards some detail permanently. The quality slider controls how much.`;
    }
    if (from.lossy && !to.lossy) {
      return `${to.label} is lossless, so the result is often larger than the ${from.label} you started with — the encoder now has to store the existing compression artefacts as if they were real detail.`;
    }
  }

  if (pair.kind === "audio") {
    if (from.lossy && to.lossy) {
      return `Both formats are lossy, so this is a second round of compression on audio that has already lost detail. It is fine for listening, but avoid repeating it.`;
    }
    if (!from.lossy && to.lossy) {
      return `${to.label} is lossy. The result will be much smaller than the ${from.label}, and the discarded detail cannot be recovered.`;
    }
    if (from.lossy && !to.lossy) {
      return `Converting to ${to.label} cannot restore what ${from.label} already discarded — it preserves exactly what is there now, in a much larger file.`;
    }
  }

  if (pair.kind === "video") {
    return `This is a full re-encode: every frame is decoded and compressed again. In the browser that runs far slower than native software, so expect minutes rather than seconds on a long clip.`;
  }

  if (pair.kind === "gif") {
    if (pair.component === "video-to-gif") {
      return (
        "GIF holds 256 colours and no audio, and stores every frame in full rather than " +
        "the difference between frames. A few seconds is fine; a whole clip would run to " +
        "hundreds of megabytes, which is why the tool asks for a range and caps it."
      );
    }
    return pair.to === "mp4"
      ? "MP4 stores the difference between frames, where GIF stores every frame in full. The result is usually a small fraction of the size, and it still loops in a browser."
      : "GIF holds 256 colours and no partial transparency, where APNG holds millions and full alpha. Some quality is always lost here — it is worth doing only when the destination cannot read APNG.";
  }

  if (pair.kind === "video-audio") {
    return `Only the audio track is kept — the video is discarded entirely. If the file has no audio track, the tool says so rather than handing you an empty MP3.`;
  }

  return null;
}
