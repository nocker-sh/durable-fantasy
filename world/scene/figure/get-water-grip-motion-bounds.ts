import { getArmGripMotionBound } from "#/world/scene/figure/get-arm-grip-motion-bound"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Pick<Parameters<typeof getArmGripMotionBound>[0], "look" | "skeleton"> & { parts: readonly WaterVesselPart[]; delta: Point3; poles: Readonly<Record<"l" | "r", Point3>> }

/** Resolve both translated handle centres so the enclosure uses the same grip targets as the pose solver. */
export function getWaterGripMotionBounds(props: Props) {
  const delta = props.delta
  const bounds = (["l", "r"] satisfies ("l" | "r")[]).map((hand) => {
    const bar = props.parts.find((part) => part.kind === "capsule" && part.section === "grip" && part.side === hand)
    if (!bar || bar.kind !== "capsule") return new Error("Moving water vessel has no grip pair")
    const centre = bar.from.map((value, axis) => (value + bar.to[axis]) / 2),
      from: Point3 = [centre[0] - delta[0] / 2, centre[1] - delta[1] / 2, centre[2] - delta[2] / 2],
      to: Point3 = [centre[0] + delta[0] / 2, centre[1] + delta[1] / 2, centre[2] + delta[2] / 2]
    return getArmGripMotionBound({ look: props.look, skeleton: props.skeleton, hand, from, to, pole: props.poles[hand] })
  })
  const l = bounds[0],
    r = bounds[1]
  if (l instanceof Error) return l
  if (r instanceof Error) return r

  return { l, r }
}
