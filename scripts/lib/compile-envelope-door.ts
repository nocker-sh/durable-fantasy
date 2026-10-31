import { getEnvelopeDoorSource } from "#/scripts/lib/get-envelope-door-source"
import { getEnvelopeDoorProjection } from "#/scripts/lib/get-envelope-door-projection"
import type { getEnvelopeEntry } from "#/scripts/lib/get-envelope-entry"
import type { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { BuildingEnvelope } from "#/world/town/building-envelope"

type Props = Readonly<{
  entry: ReturnType<typeof getEnvelopeEntry>
  entrance: NonNullable<ReturnType<typeof entryStepGeometry>>
  frame: SpatialFrame
  cellM: number
  entryHeight: number
  metresPerTile: number
}>

/** Keep outdoor renderer units at the assembly boundary, separate from the measured leaf and its alignment. */
export function compileEnvelopeDoor(props: Props): BuildingEnvelope["door"] {
  const source = getEnvelopeDoorSource(props.entry, props.entryHeight)
  const projection = getEnvelopeDoorProjection({ ...props, origin: source.origin, swing: source.swing })
  const metres = props.metresPerTile
  return {
    point: props.entrance.upperPoint,
    outward: props.entrance.outward,
    handleAlong: source.handleAlong / metres,
    braceProjection: source.fittings.brace_projection_m / metres,
    handleProjection: source.fittings.handle_projection_m / metres,
    leafBottom: source.section.bottom / metres,
    leafTop: source.section.top / metres,
    recess: projection.recess,
    leafThickness: source.leaf.thickness_m / metres,
    frameInset: source.leaf.frame_inset_m / metres,
    hingeSign: projection.hingeSign,
    width: props.entrance.doorwayWidth / metres,
    height: props.entryHeight / metres,
  }
}
