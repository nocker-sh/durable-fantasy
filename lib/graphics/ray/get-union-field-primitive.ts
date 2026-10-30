import { getBoundedUnionDistance } from "./get-bounded-union-distance"
import type { BoundedField } from "../../engine/field-separation"
import type { Vector3Tuple as V3 } from "../../engine/vector3-types"
import type { PrimitiveShape } from "./primitive-types"

/** Retain every component's finite domain when converting bounded fields to one drawable surface. */
export function getUnionFieldPrimitive(fields: readonly BoundedField[]) {
  if (
    !fields.length ||
    fields.some((field) => ![...field.min, ...field.max, field.lipschitz, field.level ?? 0].every(Number.isFinite) || field.lipschitz <= 0 || field.min.some((value, axis) => value > field.max[axis]))
  )
    return new Error("Invalid union fields")
  const min: V3 = [0, 0, 0],
    max: V3 = [0, 0, 0],
    centre: V3 = [0, 0, 0]
  for (const axis of [0, 1, 2]) {
    min[axis] = Math.min(...fields.map((field) => field.min[axis]))
    max[axis] = Math.max(...fields.map((field) => field.max[axis]))
    centre[axis] = min[axis] / 2 + max[axis] / 2
  }
  const radius = Math.hypot(...max.map((value, axis) => value - centre[axis]))
  if (!Number.isFinite(radius) || radius <= 0) return new Error("Empty union volume")

  return {
    kind: "sdf",
    bounds: { min, max },
    a: centre,
    b: centre,
    r: radius,
    r2: 0,
    sdLipschitz: Math.max(1, ...fields.map((field) => field.lipschitz)),
    sd: (point: V3) => getBoundedUnionDistance({ fields, point }),
  } satisfies PrimitiveShape
}
