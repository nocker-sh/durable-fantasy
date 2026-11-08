import type { RGB } from "#/lib/graphics/pixel-types"
import { r } from "#/world/art/items/r"

export const ramp3 = (ramp: string): Record<string, RGB> => ({ h: r(ramp, 4), m: r(ramp, 2), s: r(ramp, 0) })
