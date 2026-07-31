"use client";

import { useState, useEffect } from "react";

/**
 * An <audio> player for a result Blob.
 *
 * The object URL is minted once per mount and revoked on unmount. Doing it
 * inline in JSX — `src={URL.createObjectURL(blob)}` — mints a fresh URL on
 * every render and revokes none of them, which pins the whole decoded track in
 * memory once per keystroke anywhere in the tool.
 *
 * Callers must give this a `key` tied to the result so a new result remounts
 * the component rather than reusing the old URL.
 */
export default function BlobAudio({ blob, className = "" }: { blob: Blob; className?: string }) {
  const [url] = useState(() => URL.createObjectURL(blob));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <audio controls src={url} className={`w-full ${className}`}>
      Your browser does not support audio playback.
    </audio>
  );
}
