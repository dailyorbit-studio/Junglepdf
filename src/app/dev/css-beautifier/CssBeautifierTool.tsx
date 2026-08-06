"use client";

import CodeFormatterTool from "@/components/CodeFormatterTool";
import { formatCSS, minifyCSS } from "@/lib/css-formatter";

export default function CssBeautifierTool() {
  return (
    <CodeFormatterTool
      format={formatCSS}
      minify={minifyCSS}
      formatLabel="Beautify"
      placeholder=".card{padding:1rem;color:#333}@media(max-width:600px){.card{padding:.5rem}}"
    />
  );
}
