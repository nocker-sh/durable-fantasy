import { getSkirtDimensions } from "#/world/scene/figure/get-skirt-dimensions"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { scaleVector3 as mul } from "#/lib/engine/scale-vector3"
import { normalizeVector3 as norm } from "#/lib/engine/normalize-vector3"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import type { BodyContext } from "#/world/scene/figure/context"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
export type SkirtLayer = "skirt" | "overskirt" | "frill"

/** Preserve standing cloth length along waist, lap and hanging hem; short skirts end before the knee. */
export function getDrapedSkirtProfile(context: BodyContext, layer: SkirtLayer) {
  const scale = context.S,
    dimensions = getSkirtDimensions(context)
  const waist = context.UW([0, dimensions.waistRise + (layer === "overskirt" ? 0.01 * scale : 0), 0]),
    hip = context.hip
  const waistLength = Math.hypot(...sub(waist, hip)),
    total = context.restHip[1] + dimensions.waistRise - dimensions.hemHeight + (layer === "overskirt" ? -0.03 : layer === "frill" ? 0.03 : 0) * scale
  const knees = lerp3(context.J.calf_l, context.J.calf_r, 0.5),
    direction: V3 = [knees[0] - hip[0], 0, knees[2] - hip[2]]
  const lapLength = Math.min(total - waistLength, Math.hypot(...direction)) * context.fold
  if (context.fold <= 0 || context.fold > 1 || ![waistLength, total, lapLength].every(Number.isFinite) || waistLength <= 0 || lapLength <= 0 || total <= waistLength)
    return new Error("Invalid draped skirt length")
  const knee = add(hip, mul(norm(direction), lapLength)),
    hem = add(knee, [0, -(total - waistLength - lapLength), 0])
  const radius = dimensions.hemRadius
  const waistRadius = dimensions.waistRadius

  return {
    total,
    start: layer === "frill" ? total - 0.06 * scale : 0,
    radius: radius * (layer === "overskirt" ? 1.06 : layer === "frill" ? 0.97 : 1),
    waistRadius: layer === "frill" ? radius * 0.94 : waistRadius * (layer === "overskirt" ? 1.1 : 1),
    points: [waist, hip, knee, hem],
    distances: [0, waistLength, waistLength + lapLength, total],
    forward: norm(direction),
    hip,
  }
}
