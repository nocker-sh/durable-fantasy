import type { FramedWindow, WindowFixture } from "#/world/town/room-fixtures"
import type { Cell } from "#/world/town/interiors"
import type { Rect } from "#/world/town/floorplan/types"

type Props = Readonly<{ window: WindowFixture; bounds: Rect; scale: number; wallMetres: number | undefined }>

/** A window needs measured wall thickness; unknown dimensions never become a NaN renderer depth. */
export function projectInteriorWindow(props: Props): FramedWindow {
  const window = props.window,
    bounds = props.bounds,
    scale = props.scale,
    wall = props.wallMetres
  if (typeof wall !== "number" || !Number.isFinite(wall) || wall <= 0) throw new Error(`Window ${window.id} has no positive wall thickness`)
  const points: Record<WindowFixture["side"], Cell> = {
    n: [bounds.x0 + window.along * scale, bounds.z0],
    s: [bounds.x0 + window.along * scale, bounds.z1],
    w: [bounds.x0, bounds.z0 + window.along * scale],
    e: [bounds.x1, bounds.z0 + window.along * scale],
  }
  const normals: Record<WindowFixture["side"], Cell> = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }
  const fixture = {
    id: window.id,
    point: points[window.side],
    outward: normals[window.side],
    width: window.width * scale,
    sill: window.sill * scale,
    height: window.height * scale,
    frame: window.frame * scale,
    depth: wall * scale,
  }
  if (![...fixture.point, fixture.width, fixture.sill, fixture.height, fixture.frame, fixture.depth].every(Number.isFinite)) throw new Error(`Invalid projected interior window: ${window.id}`)
  return fixture
}
