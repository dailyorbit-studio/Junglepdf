"use client";

import EncodeDecodeTool from "@/components/EncodeDecodeTool";
import { textToMorse, morseToText } from "@/lib/morse";

export default function MorseCodeTool() {
  return (
    <EncodeDecodeTool
      encode={textToMorse}
      decode={morseToText}
      plainLabel="Text"
      encodedLabel="Morse"
      placeholderEncode="SOS help"
      placeholderDecode="... --- ... / .... . .-.. .--."
      errorMessage="Could not read this as Morse — use dots, dashes, spaces between letters and / between words."
    />
  );
}
