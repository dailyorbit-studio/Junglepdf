"use client";

import UnitConverter from "@/components/UnitConverter";
import { WEIGHT, convertLinear } from "@/lib/units";

export default function WeightTool() {
  return <UnitConverter units={WEIGHT} initialFrom="kg" initialTo="lb" convert={convertLinear} />;
}
