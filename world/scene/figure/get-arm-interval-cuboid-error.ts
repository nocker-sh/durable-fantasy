import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { canSeparateLimbFromCuboid } from "#/lib/graphics/ray/can-separate-limb-from-cuboid"
import type { Skel } from "#/world/scene/rig"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = { skeleton: Skel; scale: number; margins: Readonly<Record<"l" | "r", number>>; boxes: readonly Cuboid[]; rootY: number; ceiling: number }

/** Uncut arms and cuffs enclose rotating palm openings and wrist clips throughout a certified interval. */
export function getArmIntervalCuboidError(props: Props): Error | null {
  if (![props.scale, props.margins.l, props.margins.r, props.rootY, props.ceiling].every(Number.isFinite) || props.scale <= 0 || props.ceiling <= 0 || props.margins.l < 0 || props.margins.r < 0)
    return new Error("Invalid arm interval enclosure")
  const joints = props.skeleton.p
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const raw = nativeArmSurfaces({ scale: props.scale, shoulder: joints[`upperarm_${hand}`], elbow: joints[`lowerarm_${hand}`], wrist: joints[`hand_${hand}`] })
    for (const surface of [raw.arm, raw.uncutCuff]) {
      if (surface.bounds.min[1] + props.rootY - props.margins[hand] < 0 || surface.bounds.max[1] + props.rootY + props.margins[hand] > props.ceiling)
        return new Error("Arm interval leaves its floor or ceiling")
      for (const box of props.boxes) if (!canSeparateLimbFromCuboid({ surface, box, margin: props.margins[hand] })) return new Error("Arm interval clearance from a solid remains unresolved")
    }
  }

  return null
}
