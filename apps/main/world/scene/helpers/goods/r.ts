import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"

export const R = (a: string[]) => a.map(hex)
