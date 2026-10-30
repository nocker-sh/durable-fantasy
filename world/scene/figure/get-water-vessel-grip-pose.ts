import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { createBodyContext } from "#/world/scene/figure/context"
import { solveBimanualGrip } from "#/world/scene/figure/solve-bimanual-grip"
import { getWaterVesselNativeParts } from "#/world/scene/figure/get-water-vessel-native-parts"
import { getWaterHandleGripProfile } from "#/world/scene/figure/get-water-handle-grip-profile"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
type Props = { look: Look; skeleton: Skel; parts: readonly WaterVesselPart[]; position: Point3; scale: number; poles: Record<"l" | "r", Point3> }

/** Solve the two physical handle centres while retaining shoulders, feet and bone lengths. */
export function getWaterVesselGripPose(props: Props) {
  const rootY = groundFootwear(buildBody(props.look, props.skeleton, null).footwear).rootY
  const parts = getWaterVesselNativeParts({ parts: props.parts, position: props.position, scale: props.scale, rootY })
  if (parts instanceof Error) return parts
  const left = parts.find((part) => part.kind === "capsule" && part.section === "grip" && part.side === "l"),
    right = parts.find((part) => part.kind === "capsule" && part.section === "grip" && part.side === "r")
  if (!left || left.kind !== "capsule" || !right || right.kind !== "capsule") return new Error("Water vessel has no pair of grip bars")
  const middle = (part: typeof left): Point3 => [(part.from[0] + part.to[0]) / 2, (part.from[1] + part.to[1]) / 2, (part.from[2] + part.to[2]) / 2]
  const solved = solveBimanualGrip({ skeleton: props.skeleton, grips: { l: middle(left), r: middle(right) }, poles: props.poles })
  if (solved instanceof Error) return new Error("Water vessel grip is unreachable without stretching", { cause: solved })
  const bodyScale = createBodyContext(props.look, props.skeleton, null).S
  const l = getWaterHandleGripProfile({ skeleton: solved.skeleton, hand: "l", bar: left, bodyScale }),
    r = getWaterHandleGripProfile({ skeleton: solved.skeleton, hand: "r", bar: right, bodyScale })
  if (l instanceof Error) return l
  if (r instanceof Error) return r

  return { ...solved, rootY, parts, skeleton: { ...solved.skeleton, handGrips: { ...solved.skeleton.handGrips, l, r } } }
}
