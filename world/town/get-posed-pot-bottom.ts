import { qrot } from "#/lib/engine/qrot"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
type Props = { profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error>; pose: Exclude<ReturnType<typeof getPouringPotPose>, Error> }

/** For forward tilts up to a right angle, each ring's positive-X lip is lowest; handle endpoint spheres conservatively enclose every bar. */
export function getPosedPotBottom(props: Props): number {
  const p = props.profile.dimensions,
    rotation = props.pose.rotation
  const body = props.profile.outer.map((point) => {
    const lip = p.lipLength * Math.max(0, Math.min(1, (point[1] - p.lipStart) / (p.height - p.lipStart)))
    return qrot(rotation, [point[0] + lip, point[1], 0])[1]
  })
  const handle = props.profile.handle.flatMap((section) => [qrot(rotation, [...section.from])[1] - section.radius, qrot(rotation, [...section.to])[1] - section.radius])

  return props.pose.at[1] + Math.min(...body, ...handle)
}
