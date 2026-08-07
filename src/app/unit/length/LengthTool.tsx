"use client";

import UnitConverter from "@/components/UnitConverter";
import { LENGTH, convertLinear } from "@/lib/units";

export default function LengthTool() {
  return <UnitConverter units={LENGTH} initialFrom="cm" initialTo="in" convert={convertLinear} />;
}
