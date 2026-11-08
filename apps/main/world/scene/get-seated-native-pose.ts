import { withSeatedRestArms, type SeatedArmRest } from "#/world/scene/with-seated-rest-arms"
import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { seatedRoot } from "#/world/scene/seated-root"
import type { Look } from "#/world/scene/figure/look"
import type { SeatedPlace } from "#/world/scene/seated-pose"
type Props = { look: Look; frame: number; place: SeatedPlace; rest?: SeatedArmRest }

/** Both contact checks and reaching use the same native frame and seated root anchoring. */
export function getSeatedNativePose(props: Props) {
  if (!Number.isSafeInteger(props.frame) || props.frame < 0 || props.frame >= FRAMES.sit || ![...props.place.at, props.place.height, props.place.heading].every(Number.isFinite))
    return new Error("Invalid seated contact frame or place")
  const skeleton = skelFor(props.look, "sit", props.frame)
  const time = ((props.frame + 0.5) / FRAMES.sit) * Math.PI * 2
  const root = seatedRoot({ look: props.look, time: time, place: props.place, scale: 1 })

  if (!props.rest) return { skeleton, root }
  const resting = withSeatedRestArms({ skeleton, root, place: props.place, rest: props.rest })
  if (resting instanceof Error) return resting

  return { skeleton: resting, root }
}
