import type { Look } from "#/world/scene/figure/look"
import { seatedSupport } from "#/world/scene/seated-support"
import type { SeatedPlace } from "#/world/scene/seated-pose"
import { seatedAnchor } from "#/world/scene/seated-anchor"

type Props = {
  look: Look
  time: number
  place: SeatedPlace
  scale: number
}

/** Root transform used by the rendered actor and physical seated-body checks. */
export function seatedRoot(props: Props): readonly [number, number, number] {
  const anchor = seatedAnchor(props.look, props.time),
    px = anchor[0],
    pz = anchor[1],
    sin = Math.sin(props.place.heading),
    cos = Math.cos(props.place.heading)
  return [props.place.at[0] - (px * cos + pz * sin) * props.scale, props.place.height - seatedSupport(props.look) * props.scale, props.place.at[1] - (-px * sin + pz * cos) * props.scale]
}
