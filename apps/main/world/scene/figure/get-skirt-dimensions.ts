import type { BodyContext } from "#/world/scene/figure/context"

/** Standing and seated layers share one native clothing profile. */
export function getSkirtDimensions(context: BodyContext) {
  const look = context.L,
    scale = context.S

  return {
    hemHeight: (look.robe ? 0.05 : look.skirt === "short" ? 0.35 : look.skirt === "mid" ? 0.27 : 0.2) * scale,
    waistRise: 0.2 * scale - 0.06 * scale,
    hemRadius: (context.kneelish ? 0.22 : look.robe ? 0.17 : look.skirt && look.skirt !== "long" ? 0.215 : 0.2) * scale,
    waistRadius: (look.skirt && look.skirt !== "long" ? 0.1 : 0.11) * scale,
  }
}
