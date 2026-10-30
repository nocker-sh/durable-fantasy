import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error>; radius: number; height: number; angle: number }

/** Shape only the upper open rim; water capacity is measured below the unchanged lip-start section. */
export function getPouringPotPoint(props: Props): Point3 | Error {
  if (![props.radius, props.height, props.angle].every(Number.isFinite) || props.radius < 0) return new Error("Invalid pouring pot surface point")
  const p = props.profile.dimensions,
    angle = Math.atan2(Math.sin(props.angle), Math.cos(props.angle))
  const vertical = Math.max(0, Math.min(1, (props.height - p.lipStart) / (p.height - p.lipStart))),
    across = Math.max(0, 1 - Math.abs(angle) / p.lipHalfAngle)

  return [props.radius * Math.cos(props.angle) + p.lipLength * vertical * across, props.height, props.radius * Math.sin(props.angle)]
}
