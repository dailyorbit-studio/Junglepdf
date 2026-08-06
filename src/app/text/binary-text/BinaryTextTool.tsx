"use client";

import EncodeDecodeTool from "@/components/EncodeDecodeTool";

function encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return [...bytes].map((b) => b.toString(2).padStart(8, "0")).join(" ");
}

function decode(binary: string): string {
  const groups = binary.trim().split(/\s+/);
  if (groups.some((g) => !/^[01]{1,8}$/.test(g))) {
    throw new Error("invalid binary");
  }
  const bytes = Uint8Array.from(groups.map((g) => parseInt(g, 2)));
  return new TextDecoder().decode(bytes);
}

export default function BinaryTextTool() {
  return (
    <EncodeDecodeTool
      encode={encode}
      decode={decode}
      plainLabel="Text"
      encodedLabel="Binary"
      placeholderEncode="Hi!"
      placeholderDecode="01001000 01101001 00100001"
      errorMessage="Could not read this as binary — use groups of 0s and 1s separated by spaces."
    />
  );
}
