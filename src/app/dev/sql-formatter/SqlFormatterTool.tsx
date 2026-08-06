"use client";

import CodeFormatterTool from "@/components/CodeFormatterTool";
import { formatSQL, minifySQL } from "@/lib/sql-formatter";

export default function SqlFormatterTool() {
  return (
    <CodeFormatterTool
      format={formatSQL}
      minify={minifySQL}
      formatLabel="Format"
      placeholder="select id, name, email from users u join orders o on o.user_id = u.id where u.active = 1 and o.total > 100 order by o.total desc"
    />
  );
}
