"use client";

import PdfToImagesTool from "../pdf-to-images/PdfToImagesTool";

/** PDF to Images with PNG locked in — see PdfToJpgTool for why this exists. */
export default function PdfToPngTool() {
  return <PdfToImagesTool lockFormat="image/png" />;
}
