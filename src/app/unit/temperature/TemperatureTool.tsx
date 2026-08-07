"use client";

import UnitConverter from "@/components/UnitConverter";
import { TEMPERATURE, convertTemperature } from "@/lib/units";

export default function TemperatureTool() {
  return <UnitConverter units={TEMPERATURE} initialFrom="c" initialTo="f" convert={convertTemperature} />;
}
