"use client";

import PdfOverlayEditor from "@/components/PdfOverlayEditor";

export default function EditPdfTool() {
  return (
    <PdfOverlayEditor
      instruments={["text", "whiteout", "box", "highlight", "pen"]}
      initial="text"
      actionLabel="Save changes"
      hint="Click to add text, or drag to white out, box or highlight an area."
      caveatTitle="What editing a PDF can and cannot mean"
      caveats={[
        "You add on top of the page — existing text cannot be retyped in place",
        "White out covers something opaquely, then add your text over it",
        "The original text is still in the file underneath anything you cover",
        "To remove content for real, use Redact PDF instead",
      ]}
    />
  );
}
