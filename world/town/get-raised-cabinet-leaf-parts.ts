import { getSlidingCabinetLeafDefinition } from "#/world/town/get-sliding-cabinet-leaf-definition"
import type { SlidingCabinetSpec, SlidingCabinetPart } from "#/world/town/sliding-cabinet-types"
import type { RaisedCabinetHandleSpec } from "#/world/town/raised-cabinet-handle-types"
type Props = Readonly<{ spec: SlidingCabinetSpec; handle: RaisedCabinetHandleSpec; leaf: "north" | "south"; offset: number }>

/** The handle alternative uses a solid leaf, two attached posts and a real vertical wooden bar; no grip target floats in front of a finger hole. */
export function getRaisedCabinetLeafParts(props: Props) {
  const panel = getSlidingCabinetLeafDefinition(props).panel,
    h = props.handle,
    locations = { north: panel.z1 - h.northFromMeeting, south: panel.z0 + h.southFromMeeting },
    z = locations[props.leaf]
  const bar: SlidingCabinetPart = {
    part: "handle-bar",
    leaf: props.leaf,
    x0: panel.x0 - h.standOff,
    x1: panel.x0 - h.standOff + h.thickness,
    z0: z - h.thickness / 2,
    z1: z + h.thickness / 2,
    bottom: h.centreY - h.height / 2,
    top: h.centreY + h.height / 2,
  }
  const posts: SlidingCabinetPart[] = [bar.bottom, bar.top - h.thickness].map((bottom) => ({ ...bar, part: "handle-post", x1: panel.x1, bottom, top: bottom + h.thickness }))

  return {
    bar,
    posts,
    panel: { ...panel, part: "panel", leaf: props.leaf } satisfies SlidingCabinetPart,
    all: [{ ...panel, part: "panel", leaf: props.leaf } satisfies SlidingCabinetPart, ...posts, bar],
  }
}
