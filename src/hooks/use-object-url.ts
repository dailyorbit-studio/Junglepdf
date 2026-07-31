"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Owns a single object URL, revoking the previous one whenever it's replaced
 * and on unmount.
 *
 * Used for image previews. A FileReader data URL would work too, but holds
 * the whole file as a base64 string — roughly 1.4x the original size — on top
 * of the File itself.
 */
export function useObjectUrl(): [string | null, (source: Blob | null) => void] {
  const [url, setUrl] = useState<string | null>(null);
  const currentRef = useRef<string | null>(null);

  const assign = useCallback((source: Blob | null) => {
    if (currentRef.current) URL.revokeObjectURL(currentRef.current);
    const next = source ? URL.createObjectURL(source) : null;
    currentRef.current = next;
    setUrl(next);
  }, []);

  useEffect(
    () => () => {
      if (currentRef.current) URL.revokeObjectURL(currentRef.current);
    },
    []
  );

  return [url, assign];
}
