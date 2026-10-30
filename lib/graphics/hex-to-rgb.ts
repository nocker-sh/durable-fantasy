import type { RGB } from "#/lib/graphics/pixel-types"
export function hexToRgb(s: string): RGB {
  const v = parseInt(s.replace("#", ""), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
