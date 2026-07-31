"use client";

import PdfToImagesTool from "../pdf-to-images/PdfToImagesTool";

/**
 * The same renderer as PDF to Images, with the format decided.
 *
 * Two routes rather than one because "pdf to jpg" and "pdf to images" are
 * different searches by a wide margin, and a page that answers the exact
 * question ranks for it. Same precedent as Extract Pages and Remove Pages,
 * which are one module behind two URLs.
 */
export default function PdfToJpgTool() {
  return <PdfToImagesTool lockFormat="image/jpeg" />;
}
