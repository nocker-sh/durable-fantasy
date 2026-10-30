import { getPersonalBoxReachPose } from "#/scripts/lib/get-personal-box-reach-pose"
import { getPersonalBoxGripFromReach } from "#/scripts/lib/get-personal-box-grip-from-reach"
type Props = Parameters<typeof getPersonalBoxReachPose>[0]

/** Reach and contact consume the same board pose without rebuilding or mutating the authored movement plan. */
export function getPersonalBoxGripPose(props: Props) {
  const frame = getPersonalBoxReachPose(props)
  if (frame instanceof Error) return frame
  return getPersonalBoxGripFromReach({ ...props, frame })
}
