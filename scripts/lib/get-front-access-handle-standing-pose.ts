import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import { getNativeGroundedFootPose } from "#/world/scene/figure/get-native-grounded-foot-pose"
import type { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
type Props = Readonly<{ source: Exclude<ReturnType<typeof getFrontAccessHandlePlan>, Error>["source"] }>

/** Prepare both actual shoes before solving the palm, so later stance changes cannot invalidate an already certified grip. */
export function getFrontAccessHandleStandingPose(props: Props) {
  const source = props.source,
    look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => `resident-${resident.name}` === source.operator)]
  if (!look || !Number.isSafeInteger(source.frame) || source.frame < 0 || source.frame >= FRAMES[source.animation]) return new Error("Invalid raised-handle native frame")
  const native = skelFor(look, source.animation, source.frame)
  const standing = getNativeGroundedFootPose({ look, skeleton: native, pelvisDrop: source.standing_support.pelvis_drop_m, offsets: { body: 0, l: [0, 0, 0], r: [0, 0, 0] } })
  if (standing instanceof Error) return standing

  return { look, native, ...standing }
}
