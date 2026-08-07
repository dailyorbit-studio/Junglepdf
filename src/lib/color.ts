/**
 * Colour maths shared by the Color tools: conversions between HEX, RGB and HSL,
 * WCAG contrast, and lightness adjustment for tints and shades. Pure functions,
 * no DOM — everything runs on the device.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const int = parseInt(h, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function rgbToHex(r: number, g: number, b: number): string {
  const v = (clamp255(r) << 16) | (clamp255(g) << 8) | clamp255(b);
  return `#${v.toString(16).padStart(6, "0")}`;
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: clamp255((r + m) * 255), g: clamp255((g + m) * 255), b: clamp255((b + m) * 255) };
}

export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/** WCAG relative luminance of an sRGB colour. */
export function relativeLuminance({ r, g, b }: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two colours, 1–21. */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Adjust a colour's lightness by a delta in percentage points. */
export function shift(hex: string, deltaL: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const l = Math.max(0, Math.min(100, hsl.l + deltaL));
  return hslToHex(hsl.h, hsl.s, l);
}
