import { qrot } from "#/lib/engine/qrot"
import { toHeadingLocalPoint } from "#/world/scene/to-heading-local-point"
import type { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { point: Point3; pose: Exclude<ReturnType<typeof getPouringPotPose>, Error>; body: readonly [number, number]; heading: number; rootY: number }

/** Every pot section shares the same rigid rotation and grounded native figure origin. */
export function getPouringPotNativePoint(props: Props): Point3 {
  const rotated = qrot(props.pose.rotation, [...props.point])

  return toHeadingLocalPoint([props.pose.at[0] + rotated[0], props.pose.at[1] + rotated[1], props.pose.at[2] + rotated[2]], [props.body[0], props.rootY, props.body[1]], props.heading)
}
