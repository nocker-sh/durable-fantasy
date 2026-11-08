import { qmul } from "#/lib/engine/qmul"
import { qrot } from "#/lib/engine/qrot"
import type { Q } from "#/lib/engine/quaternion-types"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { PouringPotPose } from "#/world/town/pouring-pot-pose-types"
type Props = { profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error>; lipAt: Point3; tilt: number; heading: number }

/** Place the measured lip over a receiver; the fixed carrying bridge tilts with the whole open vessel. */
export function getPouringPotPose(props: Props): PouringPotPose | Error {
  if (![...props.lipAt, props.tilt, props.heading].every(Number.isFinite) || props.tilt < 0 || props.tilt > Math.PI / 2) return new Error("Invalid pouring pot pose")
  const p = props.profile.dimensions,
    yaw: Q = [0, Math.sin(props.heading / 2), 0, Math.cos(props.heading / 2)],
    pitch: Q = [0, 0, -Math.sin(props.tilt / 2), Math.cos(props.tilt / 2)],
    rotation = qmul(yaw, pitch)
  const lip = qrot(rotation, [p.diameter / 2 + p.lipLength, p.height, 0]),
    at: Point3 = [props.lipAt[0] - lip[0], props.lipAt[1] - lip[1], props.lipAt[2] - lip[2]],
    grip = qrot(rotation, [p.bailForward, p.bailHeight, 0])
  const gripAt: Point3 = [at[0] + grip[0], at[1] + grip[1], at[2] + grip[2]]

  return { at, rotation, gripAt, lipAt: [...props.lipAt] satisfies Point3 }
}
