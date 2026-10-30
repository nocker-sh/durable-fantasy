import type { Proportions } from "#/world/scene/rig"
import type { Look } from "#/world/scene/figure/look"
import { shoulderHalfWidth } from "#/world/scene/figure/helpers/animation/shoulder-half-width"

export function proportions(L: Look): Proportions {
  const fem = L.sex === "f",
    S = L.age === "child" ? 0.74 : 1
  return { hipY: (fem ? 0.6 : 0.62) * S, shoulderY: (fem ? 0.39 : 0.41) * S, shW: shoulderHalfWidth(fem, S), hipW: (fem ? 0.05 : 0.06) * S, S }
}
