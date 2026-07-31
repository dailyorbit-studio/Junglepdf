/**
 * PDF to PowerPoint — one page per slide, as a picture
 *
 * The honest version of this conversion. A PDF page is a laid-out artefact:
 * text at coordinates, vector paths, embedded images, all with no notion of a
 * title, a bullet list or a content placeholder. A slide is the opposite — a
 * small set of semantic shapes that a theme arranges. There is no faithful
 * mapping from the first to the second.
 *
 * What every serious converter does, therefore, is render each page and place
 * it on a slide. That is what this does: pages become images, each image fills
 * a slide sized to that page's exact aspect ratio, and the deck is written as
 * a real .pptx.
 *
 * The result is a deck you can present, annotate over, and reorder — not one
 * you can edit the text of. Anything claiming otherwise is either running OCR
 * or guessing at structure that is not in the file. If you want the words, PDF
 * to Word or PDF to Text will give them to you properly.
 *
 * The .pptx is written by hand: it is a zip of XML, and PowerPoint's minimum
 * valid package is a presentation, a master, a layout and a theme, plus the
 * slides themselves. No library needed, same as the .docx and .xlsx writers.
 */

import { openForRender, clampScale } from "./pdf-render";
import type { ProgressFn } from "./ffmpeg";

export interface PdfToPptResult {
  blob: Blob;
  filename: string;
  slideCount: number;
  notice: string | null;
}

export const PPT_DPI_OPTIONS = [96, 150, 200] as const;
export type PptDpi = (typeof PPT_DPI_OPTIONS)[number];

export interface PdfToPptOptions {
  dpi: PptDpi;
}

/** English Metric Units: 914400 to the inch, 12700 to the point. */
const EMU_PER_POINT = 12700;

export interface SlideImage {
  bytes: ArrayBuffer;
  /** Page size in points, which sets the slide's aspect ratio. */
  widthPt: number;
  heightPt: number;
}

/* ────────────────────────── the .pptx package ────────────────────────── */

const THEME = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="JunglePDF">
<a:themeElements>
<a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
<a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2>
<a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2>
<a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4>
<a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6>
<a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme>
<a:fontScheme name="Office">
<a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
<a:fmtScheme name="Office">
<a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
<a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle>
<a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
</a:fmtScheme></a:themeElements></a:theme>`;

const SLIDE_MASTER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr/></p:spTree></p:cSld>
<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2"
 accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`;

const SLIDE_LAYOUT = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
<p:cSld name="Blank"><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr/></p:spTree></p:cSld></p:sldLayout>`;

/** One slide holding a single full-bleed picture. */
function slideXml(index: number, cx: number, cy: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
<p:grpSpPr/>
<p:pic>
<p:nvPicPr><p:cNvPr id="2" name="Page ${index}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
<p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
<p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
</p:pic>
</p:spTree></p:cSld></p:sld>`;
}

/**
 * Assemble the deck.
 *
 * Exported separately from the rendering so it can be exercised on its own —
 * the package structure is the part most likely to be subtly wrong, and it does
 * not need a browser to test.
 */
export async function buildPptx(slides: SlideImage[]): Promise<Blob> {
  if (slides.length === 0) throw new Error("There are no pages to convert.");

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  // The deck's canvas is the first page's size; PowerPoint has one slide size
  // for the whole presentation, so mixed page sizes letterbox against this.
  const cx = Math.round(slides[0].widthPt * EMU_PER_POINT);
  const cy = Math.round(slides[0].heightPt * EMU_PER_POINT);

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="jpeg" ContentType="image/jpeg"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
${slides
  .map(
    (_, i) =>
      `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  )
  .join("\n")}
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  // Slide ids must start at 256; PowerPoint rejects lower values.
  zip.file(
    "ppt/presentation.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rIdMaster"/></p:sldMasterIdLst>
<p:sldIdLst>${slides
      .map((_, i) => `<p:sldId id="${256 + i}" r:id="rIdSlide${i + 1}"/>`)
      .join("")}</p:sldIdLst>
<p:sldSz cx="${cx}" cy="${cy}"/>
<p:notesSz cx="${cy}" cy="${cx}"/>
</p:presentation>`
  );

  zip.file(
    "ppt/_rels/presentation.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdMaster" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
<Relationship Id="rIdTheme" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
${slides
  .map(
    (_, i) =>
      `<Relationship Id="rIdSlide${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
  )
  .join("\n")}
</Relationships>`
  );

  zip.file("ppt/theme/theme1.xml", THEME);
  zip.file("ppt/slideMasters/slideMaster1.xml", SLIDE_MASTER);
  zip.file(
    "ppt/slideMasters/_rels/slideMaster1.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`
  );

  zip.file("ppt/slideLayouts/slideLayout1.xml", SLIDE_LAYOUT);
  zip.file(
    "ppt/slideLayouts/_rels/slideLayout1.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`
  );

  slides.forEach((slide, i) => {
    zip.file(`ppt/slides/slide${i + 1}.xml`, slideXml(i + 1, cx, cy));
    zip.file(
      `ppt/slides/_rels/slide${i + 1}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/page${i + 1}.jpeg"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`
    );
    zip.file(`ppt/media/page${i + 1}.jpeg`, slide.bytes);
  });

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // The images are already JPEG; deflating them again buys nothing.
    compression: "DEFLATE",
    compressionOptions: { level: 3 },
  });
}

export function describeLimits(): string[] {
  return [
    "Each page becomes a picture filling one slide",
    "The text is not editable — a PDF page has no slide structure to recover",
    "Slide size follows the first page's shape, so nothing is letterboxed",
    "Good for presenting or annotating over; not for rewriting the words",
  ];
}

export async function pdfToPpt(
  file: File,
  options: PdfToPptOptions,
  onProgress?: ProgressFn
): Promise<PdfToPptResult> {
  onProgress?.("Reading PDF…", 5);

  const session = await openForRender(await file.arrayBuffer(), file.name);

  try {
    const pageCount = session.doc.numPages;
    const { renderPage } = await import("./pdf-render");
    const slides: SlideImage[] = [];
    let mixedSizes = false;

    for (let n = 1; n <= pageCount; n++) {
      onProgress?.(
        `Rendering page ${n} of ${pageCount}…`,
        8 + Math.round((n / pageCount) * 78)
      );

      const page = await session.doc.getPage(n);
      const viewport = page.getViewport({ scale: 1 });
      page.cleanup();

      const scale = clampScale(viewport.width, viewport.height, options.dpi / 72);
      const rendered = await renderPage(session.doc, n, scale, "image/jpeg", 0.85);

      if (
        slides.length > 0 &&
        Math.abs(viewport.width / viewport.height - slides[0].widthPt / slides[0].heightPt) > 0.01
      ) {
        mixedSizes = true;
      }

      slides.push({
        bytes: await rendered.blob.arrayBuffer(),
        widthPt: viewport.width,
        heightPt: viewport.height,
      });
    }

    onProgress?.("Building presentation…", 90);

    const blob = await buildPptx(slides);

    onProgress?.("Done", 100);

    const notes: string[] = [];
    notes.push(
      "Each page is a picture on its slide, so the text cannot be edited in PowerPoint. Use PDF to Word if you need the words back."
    );
    if (mixedSizes) {
      notes.push(
        "This PDF mixes page sizes. PowerPoint allows only one slide size per deck, so pages of a different shape are fitted against the first page's."
      );
    }

    return {
      blob,
      filename: file.name.replace(/\.pdf$/i, "") + ".pptx",
      slideCount: slides.length,
      notice: notes.join(" "),
    };
  } finally {
    await session.destroy();
  }
}
