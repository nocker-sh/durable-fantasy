import { getNativeLegCapsuleExternalError } from "#/world/scene/figure/get-native-leg-capsule-external-error"
import type { buildLegs } from "#/world/scene/figure/legs"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = Readonly<{ legs: ReturnType<typeof buildLegs>; margins: Readonly<Record<"l" | "r", number>>; rootY: number; ceiling: number; boxes: readonly Cuboid[] }>

/** Standing native limb control points are convex combinations of hip, knee and ankle; inflated actual capsules cover them. Shoes have a separate whole-cycle envelope. */
export function getNativeLegIntervalExternalError(props: Props): Error | null {
  if (![props.rootY, props.ceiling, props.margins.l, props.margins.r].every(Number.isFinite) || props.ceiling <= 0 || props.margins.l < 0 || props.margins.r < 0)
    return new Error("Invalid native leg interval margins")

  if (props.boxes.some((box) => ![box.x0, box.x1, box.z0, box.z1, box.bottom, box.top].every(Number.isFinite) || box.x0 >= box.x1 || box.z0 >= box.z1 || box.bottom >= box.top))
    return new Error("Invalid native leg interval obstacle")
  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const shoe = props.legs.shoeParts[side]
    if (!shoe || shoe.kind !== "cap" || props.legs.parts[side].length < 2 || !props.legs.parts[side].includes(shoe)) return new Error("Missing actual native leg parts")
    for (const primitive of props.legs.parts[side]) {
      if (primitive === props.legs.shoeParts[side]) continue
      const capsules = primitive.capsuleBounds?.(),
        margin = props.margins[side]
      if (!capsules?.length) return new Error("Native leg surface has no control-point enclosure")
      const error = getNativeLegCapsuleExternalError({ ...props, capsules, margin })
      if (error) return error
    }
  }

  return null
}
