import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { getMapSpacePoint } from "#/world/maps/get-map-space-point"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { TILE_M } from "#/world/town/fit"
import type { MapSpace } from "#/world/maps/map-space-types"
import type { FramedWindow } from "#/world/town/room-fixtures"

type Props = Readonly<{ window: FramedWindow; outside: FramedWindow; space: MapSpace; foundationMetres: number }>

/** Compare position, height, dimensions and world-facing normal in metric parent coordinates. */
export function assertInteriorWindowAlignment(props: Props): void {
  const window = props.window,
    outside = props.outside
  try {
    const point = getMapSpacePoint({ space: props.space, point: window.point, heightMetres: window.sill / ROOM_SCALE })
    const normal = new SpatialFrame(props.space.frame).direction([window.outward[0], 0, window.outward[1]])
    const actual = [...point, window.width / ROOM_SCALE, window.height / ROOM_SCALE, window.frame / ROOM_SCALE, window.depth / ROOM_SCALE, normal[0], normal[2]]
    const expected = [
      outside.point[0] * TILE_M,
      props.foundationMetres + outside.sill * TILE_M,
      outside.point[1] * TILE_M,
      outside.width * TILE_M,
      outside.height * TILE_M,
      outside.frame * TILE_M,
      outside.depth * TILE_M,
      outside.outward[0],
      outside.outward[1],
    ]
    if (actual.some((value, index) => !Number.isFinite(value) || !Number.isFinite(expected[index]) || Math.abs(value - expected[index]) > 1e-6))
      throw new Error(`Interior window alignment differs: ${window.id}`)
  } catch (error) {
    if (error instanceof RangeError) throw new Error(`Interior window alignment differs: ${window.id}`, { cause: error })
    throw error
  }
}
