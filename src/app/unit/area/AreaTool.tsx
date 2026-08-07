"use client";

import UnitConverter from "@/components/UnitConverter";
import { AREA, convertLinear } from "@/lib/units";

export default function AreaTool() {
  return <UnitConverter units={AREA} initialFrom="m2" initialTo="ft2" convert={convertLinear} />;
}
