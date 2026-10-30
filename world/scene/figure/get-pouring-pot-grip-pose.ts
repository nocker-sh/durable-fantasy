import { getPouringPotReachPose } from "#/world/scene/figure/get-pouring-pot-reach-pose"
import { getPouringPotWoodenBar } from "#/world/scene/figure/get-pouring-pot-wooden-bar"
import { getRoundBarGripProfile } from "#/world/scene/figure/get-round-bar-grip-profile"
import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { createBodyContext } from "#/world/scene/figure/context"
type Props = Parameters<typeof getPouringPotReachPose>[0]

/** Both palms enclose the same whole wooden sleeve; cuff planes stay intact and strength, heat and other pot/body contact remain unverified. */
export function getPouringPotGripPose(props: Props) {
  const reached = getPouringPotReachPose(props)
  if (reached instanceof Error) return reached
  const bar = getPouringPotWoodenBar({ ...props, rootY: reached.rootY }),
    bodyScale = createBodyContext(props.look, props.skeleton, null).S
  const l = getRoundBarGripProfile({ skeleton: reached.skeleton, hand: "l", bar, bodyScale }),
    r = getRoundBarGripProfile({ skeleton: reached.skeleton, hand: "r", bar, bodyScale })
  if (l instanceof Error) return l
  if (r instanceof Error) return r
  const skeleton = { ...reached.skeleton, handGrips: { ...reached.skeleton.handGrips, l, r } }
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const contact = getRoundBarContactError({ skeleton, hand, bar })
    if (contact) return contact
  }

  return { ...reached, skeleton, bar }
}
