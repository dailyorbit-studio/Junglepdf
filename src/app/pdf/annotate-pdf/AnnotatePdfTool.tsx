"use client";

import PdfOverlayEditor from "@/components/PdfOverlayEditor";

export default function AnnotatePdfTool() {
  return (
    <PdfOverlayEditor
      instruments={["highlight", "pen", "text"]}
      initial="highlight"
      actionLabel="Save annotations"
      hint="Drag to highlight, draw with the pen, or click to place a note."
      caveatTitle="Annotations are drawn onto the page"
      caveats={[
        "The document keeps its text layer — it stays searchable and selectable",
        "Marks are permanent page content, not comments a reader can toggle off",
        "A highlight is translucent, so the text underneath stays readable",
        "Highlighting does not hide anything — use Redact PDF to remove content",
      ]}
    />
  );
}
