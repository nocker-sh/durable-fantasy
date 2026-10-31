import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { WindowFixture, FramedWindow } from "#/world/town/room-fixtures"

type Props = Readonly<{
  window: WindowFixture
  frame: SpatialFrame
  floorLevels: readonly { floor: number; elevation: number }[]
  widthMetres: number
  depthMetres: number
  wallMetres: number
  metresPerTile: number
}>

/** World positions include the foundation; the legacy window sill stays relative to that same foundation. */
export function compileEnvelopeWindow(props: Props): FramedWindow {
  const window = props.window
  const levels = props.floorLevels.filter((level) => level.floor === window.floor)
  if (levels.length !== 1 || !Number.isFinite(levels[0].elevation)) throw new Error(`Window ${window.id} has no unique floor elevation`)
  if (!Number.isFinite(props.metresPerTile) || props.metresPerTile <= 0) throw new RangeError("Invalid window metre-to-tile scale")
  const locations: Record<WindowFixture["side"], readonly [number, number]> = { n: [window.along, 0], s: [window.along, props.depthMetres], w: [0, window.along], e: [props.widthMetres, window.along] }
  const normals: Record<WindowFixture["side"], Vector3> = { n: [0, 0, -1], s: [0, 0, 1], w: [-1, 0, 0], e: [1, 0, 0] }
  const local = locations[window.side]
  const sill = (levels[0].elevation + window.sill) / props.metresPerTile
  const point = props.frame.toWorld([local[0] / props.metresPerTile, sill, local[1] / props.metresPerTile])
  const outward = props.frame.direction(normals[window.side])
  const fixture: FramedWindow = {
    floor: window.floor,
    id: window.id,
    point: [point[0], point[2]],
    outward: [outward[0], outward[2]],
    width: window.width / props.metresPerTile,
    height: window.height / props.metresPerTile,
    sill,
    frame: window.frame / props.metresPerTile,
    depth: props.wallMetres / props.metresPerTile,
  }
  if (![...point, fixture.width, fixture.height, fixture.frame, fixture.depth].every(Number.isFinite)) throw new Error(`Window ${window.id} has an unbounded position`)
  return fixture
}
