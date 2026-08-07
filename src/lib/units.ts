/**
 * Unit definitions and conversion for the Unit Converter tools.
 *
 * Each unit carries a `factor` = how many base units it equals (metres for
 * length, kilograms for weight, and so on), so a linear conversion is just
 * `value * from.factor / to.factor`. Temperature is not linear and has its own
 * formula. Everything runs on the device — no lookup, no network.
 */

export interface Unit {
  id: string;
  label: string;
  factor: number;
}

export const LENGTH: Unit[] = [
  { id: "mm", label: "Millimetre (mm)", factor: 0.001 },
  { id: "cm", label: "Centimetre (cm)", factor: 0.01 },
  { id: "m", label: "Metre (m)", factor: 1 },
  { id: "km", label: "Kilometre (km)", factor: 1000 },
  { id: "in", label: "Inch (in)", factor: 0.0254 },
  { id: "ft", label: "Foot (ft)", factor: 0.3048 },
  { id: "yd", label: "Yard (yd)", factor: 0.9144 },
  { id: "mi", label: "Mile (mi)", factor: 1609.344 },
  { id: "nmi", label: "Nautical mile", factor: 1852 },
];

export const AREA: Unit[] = [
  { id: "mm2", label: "Square millimetre", factor: 0.000001 },
  { id: "cm2", label: "Square centimetre", factor: 0.0001 },
  { id: "m2", label: "Square metre", factor: 1 },
  { id: "ha", label: "Hectare", factor: 10000 },
  { id: "km2", label: "Square kilometre", factor: 1000000 },
  { id: "in2", label: "Square inch", factor: 0.00064516 },
  { id: "ft2", label: "Square foot", factor: 0.09290304 },
  { id: "yd2", label: "Square yard", factor: 0.83612736 },
  { id: "ac", label: "Acre", factor: 4046.8564224 },
  { id: "mi2", label: "Square mile", factor: 2589988.110336 },
];

export const VOLUME: Unit[] = [
  { id: "ml", label: "Millilitre (ml)", factor: 0.001 },
  { id: "l", label: "Litre (l)", factor: 1 },
  { id: "m3", label: "Cubic metre", factor: 1000 },
  { id: "tsp", label: "Teaspoon (US)", factor: 0.00492892 },
  { id: "tbsp", label: "Tablespoon (US)", factor: 0.01478676 },
  { id: "floz", label: "Fluid ounce (US)", factor: 0.0295735 },
  { id: "cup", label: "Cup (US)", factor: 0.2365882 },
  { id: "pt", label: "Pint (US)", factor: 0.4731765 },
  { id: "qt", label: "Quart (US)", factor: 0.9463529 },
  { id: "gal", label: "Gallon (US)", factor: 3.7854118 },
  { id: "galuk", label: "Gallon (UK)", factor: 4.5460900 },
];

export const WEIGHT: Unit[] = [
  { id: "mg", label: "Milligram (mg)", factor: 0.000001 },
  { id: "g", label: "Gram (g)", factor: 0.001 },
  { id: "kg", label: "Kilogram (kg)", factor: 1 },
  { id: "t", label: "Tonne (t)", factor: 1000 },
  { id: "oz", label: "Ounce (oz)", factor: 0.0283495 },
  { id: "lb", label: "Pound (lb)", factor: 0.4535924 },
  { id: "st", label: "Stone (st)", factor: 6.350293 },
];

export const TIME: Unit[] = [
  { id: "ms", label: "Millisecond", factor: 0.001 },
  { id: "s", label: "Second", factor: 1 },
  { id: "min", label: "Minute", factor: 60 },
  { id: "h", label: "Hour", factor: 3600 },
  { id: "d", label: "Day", factor: 86400 },
  { id: "wk", label: "Week", factor: 604800 },
  { id: "mo", label: "Month (30 days)", factor: 2592000 },
  { id: "yr", label: "Year (365 days)", factor: 31536000 },
];

export function convertLinear(value: number, from: Unit, to: Unit): number {
  return (value * from.factor) / to.factor;
}

/** Temperature units are labels only — conversion uses a formula, not a factor. */
export const TEMPERATURE: Unit[] = [
  { id: "c", label: "Celsius (°C)", factor: 1 },
  { id: "f", label: "Fahrenheit (°F)", factor: 1 },
  { id: "k", label: "Kelvin (K)", factor: 1 },
];

export function convertTemperature(value: number, from: Unit, to: Unit): number {
  // Normalise to Celsius first.
  let c: number;
  if (from.id === "c") c = value;
  else if (from.id === "f") c = ((value - 32) * 5) / 9;
  else c = value - 273.15;

  if (to.id === "c") return c;
  if (to.id === "f") return (c * 9) / 5 + 32;
  return c + 273.15;
}
