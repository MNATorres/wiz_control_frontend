import type { PresetColor } from "./types";

// Tanner Helland's approximation of black-body color temperature -> RGB,
// used to render kelvin white preset tones as swatches.
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  const t = kelvin / 100;
  const clamp = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
  const r = t <= 66 ? 255 : clamp(329.698727446 * Math.pow(t - 60, -0.1332047592));
  const g =
    t <= 66
      ? clamp(99.4708025861 * Math.log(t) - 161.1195681661)
      : clamp(288.1221695283 * Math.pow(t - 60, -0.0755148492));
  const b = t >= 66 ? 255 : t <= 19 ? 0 : clamp(138.5177312231 * Math.log(t - 10) - 305.0447927307);
  return { r, g, b };
}

// CSS color for a preset tone (kelvin whites approximated via kelvinToRgb).
export function presetColorCss(color: PresetColor): string {
  const rgb = "temp" in color ? kelvinToRgb(color.temp) : color;
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}
