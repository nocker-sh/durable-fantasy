import { buildBody } from "#/world/scene/figure/body"
import { toHeadingWorldPoint } from "#/world/scene/to-heading-world-point"
import type { NativeGroundPose } from "#/world/scene/figure/native-ground-contact-types"
import type { Look } from "#/world/scene/figure/look"
type Props = Readonly<{ look: Look; from: NativeGroundPose; to: NativeGroundPose; heading: number; sides: readonly ("l" | "r")[] }>

/** A fixed lowest point alone permits pivoting; a planted shoe preserves its entire rendered capsule in room coordinates. */
export function getNativePlantedFootwearError(props: Props): Error | null {
  if (!props.sides.length || props.sides.some((side) => side !== "l" && side !== "r")) return new Error("Native planted footwear has no declared support")
  const before = buildBody(props.look, props.from.skeleton, null).footwear,
    after = buildBody(props.look, props.to.skeleton, null).footwear

  for (const side of props.sides) {
    if (!Number.isFinite(before[side].r) || !Number.isFinite(after[side].r) || Math.abs(before[side].r - after[side].r) > 1e-9) return new Error("Native planted footwear changes shape")
    for (const end of ["a", "b"] satisfies ("a" | "b")[]) {
      const from = toHeadingWorldPoint(before[side][end], [props.from.body[0], props.from.rootY, props.from.body[1]], props.heading)
      const to = toHeadingWorldPoint(after[side][end], [props.to.body[0], props.to.rootY, props.to.body[1]], props.heading)
      if (![...from, ...to].every(Number.isFinite) || Math.hypot(...from.map((value, axis) => value - to[axis])) > 1e-9) return new Error("Native planted footwear pivots or slides")
    }
  }

  return null
}
