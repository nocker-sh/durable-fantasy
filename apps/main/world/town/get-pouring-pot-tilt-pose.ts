import { getPouringPotHeldPose } from "#/world/town/get-pouring-pot-held-pose"
import { getPosedPotBottom } from "#/world/town/get-posed-pot-bottom"
import type { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
type Props = Pick<Parameters<typeof getPouringPotPose>[0], "profile" | "heading"> & {
  finalPose: Exclude<ReturnType<typeof getPouringPotPose>, Error>
  tilt: number
  finalTilt: number
  backset: number
  clearancePlane: number
}

/** Lift according to the complete vessel's low point throughout the tilt; the operator keeps the same planted standing place. */
export function getPouringPotTiltPose(props: Props) {
  if (
    ![props.finalTilt, props.backset, props.clearancePlane].every(Number.isFinite) ||
    props.finalTilt <= 0 ||
    props.finalTilt > Math.PI / 2 ||
    props.tilt < 0 ||
    props.tilt > props.finalTilt ||
    props.backset < 0
  )
    return new Error("Invalid pouring pot tilt path")
  const zero = getPouringPotHeldPose({ profile: props.profile, heading: props.heading, tilt: props.tilt, gripAt: [0, 0, 0] })
  if (zero instanceof Error) return zero
  const bottom = getPosedPotBottom({ profile: props.profile, pose: zero }),
    height = props.clearancePlane - bottom

  return getPouringPotHeldPose({
    profile: props.profile,
    heading: props.heading,
    tilt: props.tilt,
    gripAt: [props.finalPose.gripAt[0], height, props.finalPose.gripAt[2] + props.backset * (1 - props.tilt / props.finalTilt)],
  })
}
