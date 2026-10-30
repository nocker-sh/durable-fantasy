import { createPouringPot } from "#/world/scene/construction/create-pouring-pot"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import type { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
type Props = { profile: Exclude<ReturnType<typeof getPouringPotProfile>, Error>; pose: Exclude<ReturnType<typeof getPouringPotPose>, Error> }

/** The removable lid remains at the stove; use the same body, bridge and grip for the tilted shape. */
export function createPosedPouringPot(props: Props) {
  const pot = createPouringPot({ profile: props.profile, at: props.pose.at, heading: 0, lid: "absent" })
  if (pot instanceof Error) return pot
  pot.quaternion.set(...props.pose.rotation)

  return pot
}
