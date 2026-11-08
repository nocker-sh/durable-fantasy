import { getHeldWaterVesselPose } from "#/world/scene/figure/get-held-water-vessel-pose"
import { getWaterGripMotionBounds } from "#/world/scene/figure/get-water-grip-motion-bounds"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Omit<Parameters<typeof getHeldWaterVesselPose>[0], "position"> & { from: Point3; to: Point3 }

/** Freeze the native clip frame while both grips follow one rigid translation, then enclose the complete interval. */
export function getWaterMotionInterval(props: Props) {
  if (![...props.from, ...props.to].every(Number.isFinite)) return new Error("Invalid water vessel motion interval")
  const position = props.from.map((value, axis) => (value + props.to[axis]) / 2),
    midpoint: Point3 = [position[0], position[1], position[2]]
  const posed = getHeldWaterVesselPose({ ...props, position: midpoint })
  if (posed instanceof Error) return posed
  const delta: Point3 = [(props.to[0] - props.from[0]) / props.scale, (props.to[1] - props.from[1]) / props.scale, (props.to[2] - props.from[2]) / props.scale]
  const motion = getWaterGripMotionBounds({ ...props, parts: posed.parts, delta })
  if (motion instanceof Error) return motion

  return { posed, motion, margins: { l: motion.l.surface / 2 + 1e-10, r: motion.r.surface / 2 + 1e-10 }, vesselMargin: Math.hypot(...delta) / 2 + 1e-10 }
}
