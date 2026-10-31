import type { Vector3 } from "#/lib/engine/vector3-types"
import type { WindowFixture } from "#/world/town/room-fixtures"
import type { EnvelopeWindowSource } from "#/scripts/lib/envelope-window-types"

/** Map through the shared frame and retain the window ID when the numeric transform is unbounded. */
export function getEnvelopeWindowProjection(props: EnvelopeWindowSource) {
  const window = props.window,
    levels = props.floorLevels.filter((level) => level.floor === window.floor)
  if (levels.length !== 1 || !Number.isFinite(levels[0].elevation)) throw new Error(`Window ${window.id} has no unique floor elevation`)
  if (!Number.isFinite(props.metresPerTile) || props.metresPerTile <= 0) throw new RangeError("Invalid window metre-to-tile scale")
  const locations: Record<WindowFixture["side"], readonly [number, number]> = { n: [window.along, 0], s: [window.along, props.depthMetres], w: [0, window.along], e: [props.widthMetres, window.along] }
  const normals: Record<WindowFixture["side"], Vector3> = { n: [0, 0, -1], s: [0, 0, 1], w: [-1, 0, 0], e: [1, 0, 0] }
  const local = locations[window.side],
    sill = (levels[0].elevation + window.sill) / props.metresPerTile
  try {
    const point = props.frame.toWorld([local[0] / props.metresPerTile, sill, local[1] / props.metresPerTile])
    return { point, outward: props.frame.direction(normals[window.side]), sill }
  } catch (error) {
    if (error instanceof RangeError) throw new Error(`Window ${window.id} has an unbounded position`, { cause: error })
    throw error
  }
}
