"use client";

import UnitConverter from "@/components/UnitConverter";
import { VOLUME, convertLinear } from "@/lib/units";

export default function VolumeTool() {
  return <UnitConverter units={VOLUME} initialFrom="l" initialTo="gal" convert={convertLinear} />;
}
