import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"

export const hexes = (h: string, m: string, s: string) => ({ h: hex(h), m: hex(m), s: hex(s) })
