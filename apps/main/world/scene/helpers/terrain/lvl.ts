import { RAMPS } from "#/world/scene/pix"
import type { RGB } from "#/lib/graphics/pixel-types"

export const lvl = (ramp: string, i: number): RGB => {
  const r = RAMPS[ramp]
  return r[Math.max(0, Math.min(r.length - 1, i))]
}
