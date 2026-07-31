/**
 * Blob download helper.
 *
 * Tools hold their output as a Blob and mint the object URL only at the
 * moment of download, so nothing is left dangling. Previously each tool
 * created a URL on completion and never revoked it, pinning every result in
 * memory for the life of the tab.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Revoking synchronously can cancel the transfer in Firefox, which reads
  // the blob asynchronously after the click. Give it a generous window.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
