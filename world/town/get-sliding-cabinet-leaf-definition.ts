import type { SlidingCabinetSpec } from "#/world/town/sliding-cabinet-types"
type Props = Readonly<{ spec: SlidingCabinetSpec; leaf: "north" | "south"; offset: number }>

/** The same physical cutout locates the rendered hole and any hand target; leaf motion carries both together. */
export function getSlidingCabinetLeafDefinition(props: Props) {
  const spec = props.spec,
    b = spec.bounds,
    start = { north: 0, south: 1 },
    index = start[props.leaf]
  const width = (b.z1 - b.z0 - 2 * spec.board + spec.overlap) / 2,
    x = b.x0 + spec.guide + index * (spec.panel + spec.guide)
  const z = b.z0 + spec.board + index * (b.z1 - b.z0 - 2 * spec.board - width) + props.offset
  const meeting = { north: z + width - spec.pull.fromMeeting, south: z + spec.pull.southFromMeeting },
    centre = meeting[props.leaf]
  const pullWidths = { north: spec.pull.width, south: spec.pull.southWidth },
    pullWidth = pullWidths[props.leaf]
  const panel = { x0: x, x1: x + spec.panel, z0: z, z1: z + width, bottom: spec.storageFloor, top: b.top - spec.board }

  return { panel, pull: { ...panel, z0: centre - pullWidth / 2, z1: centre + pullWidth / 2, bottom: spec.pull.bottom, top: spec.pull.bottom + spec.pull.height } }
}
