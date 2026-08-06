"use client";

import CodeFormatterTool from "@/components/CodeFormatterTool";
import { formatHTML, minifyHTML } from "@/lib/html-formatter";

export default function HtmlFormatterTool() {
  return (
    <CodeFormatterTool
      format={formatHTML}
      minify={minifyHTML}
      formatLabel="Format"
      placeholder='<section><h1>Title</h1><p>Some <a href="#">text</a> here.</p></section>'
    />
  );
}
