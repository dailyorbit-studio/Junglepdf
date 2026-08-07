"use client";

import UnitConverter from "@/components/UnitConverter";
import { TIME, convertLinear } from "@/lib/units";

export default function TimeTool() {
  return <UnitConverter units={TIME} initialFrom="h" initialTo="min" convert={convertLinear} />;
}
