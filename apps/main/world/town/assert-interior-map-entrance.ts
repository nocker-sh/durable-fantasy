import { SpatialFrame } from "#/lib/engine/spatial-frame"
import { getMapSpacePoint } from "#/world/maps/get-map-space-point"
import { assertInteriorEntranceCells } from "#/world/town/assert-interior-entrance-cells"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { TILE_M } from "#/world/town/fit"
import type { Interior } from "#/world/town/interiors"
import type { MapSpace } from "#/world/maps/map-space-types"

/** Only the ground floor joins the street; compare its opening in the physical parent frame. */
export function assertInteriorMapEntrance(interior: Interior, space: MapSpace): void {
  if (interior.floor !== 0) return
  const site = interior.house.authored?.exterior,
    entrance = interior.entrance,
    width = interior.doorWidth,
    height = interior.doorHeight
  if (!site || !entrance || typeof width !== "number" || typeof height !== "number" || ![width, height].every((value) => Number.isFinite(value) && value > 0))
    throw new Error(`Interior entrance dimensions are incomplete: ${interior.id}`)
  try {
    const point = getMapSpacePoint({ space, point: entrance.point, heightMetres: 0 })
    const normal = new SpatialFrame(space.frame).direction([entrance.outward[0], 0, entrance.outward[1]])
    const actual = [...point, width / ROOM_SCALE, height / ROOM_SCALE, normal[0], normal[2]]
    const expected = [site.door.point[0] * TILE_M, site.floorY * TILE_M, site.door.point[1] * TILE_M, site.door.width * TILE_M, site.door.height * TILE_M, site.door.outward[0], site.door.outward[1]]
    if (actual.some((value, index) => !Number.isFinite(value) || !Number.isFinite(expected[index]) || Math.abs(value - expected[index]) > 1e-6))
      throw new Error(`Interior entrance alignment differs: ${interior.id}`)
  } catch (error) {
    if (error instanceof RangeError) throw new Error(`Interior entrance alignment differs: ${interior.id}`, { cause: error })
    throw error
  }
  assertInteriorEntranceCells(interior, entrance)
}
