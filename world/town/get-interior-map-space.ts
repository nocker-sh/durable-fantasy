import { getAuthoredRoomSpace } from "#/world/town/floorplan/get-authored-room-space"
import { assertAuthoredSiteFrame } from "#/world/town/floorplan/assert-authored-site-frame"
import { assertAuthoredFloorLevels } from "#/world/town/floorplan/assert-authored-floor-levels"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { TILE_M } from "#/world/town/fit"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { MapSpace } from "#/world/maps/map-space-types"
import type { Interior } from "#/world/town/interiors"

/** Anchor only explicitly authored interiors with a known site; legacy maps retain unknown physical placement. */
export function getInteriorMapSpace(interior: Interior): MapSpace | undefined {
  const source = interior.house.authored,
    site = source?.exterior
  if (!interior.authored || !source || !site || !source.parentMap) return undefined
  if (source.id !== interior.house.id || source.parentMap !== interior.house.map) throw new Error(`Interior has no matching authored parent map: ${interior.id}`)
  assertAuthoredSiteFrame(source)
  assertAuthoredFloorLevels(source.floorLevels, source.floors)
  const level = source.floorLevels.find((level) => level.floor === interior.floor)
  const width = source.width * source.cellM,
    depth = source.depth * source.cellM
  if (
    !level ||
    ![interior.x0, interior.z0, interior.x1, interior.z1].every(Number.isFinite) ||
    Math.abs((interior.x1 - interior.x0) / ROOM_SCALE - width) > 1e-6 ||
    Math.abs((interior.z1 - interior.z0) / ROOM_SCALE - depth) > 1e-6
  )
    throw new Error(`Interior dimensions have no matching authored map space: ${interior.id}`)
  const origin: Vector3 = [site.bounds[0] * TILE_M, site.floorY * TILE_M + level.elevation, site.bounds[1] * TILE_M]
  if (!origin.every(Number.isFinite)) throw new Error(`Unbounded interior map space: ${interior.id}`)
  return {
    rooms: source.rooms.filter((room) => room.floor === interior.floor).map((room) => ({ ...getAuthoredRoomSpace(room, source), heightMetres: level.ceiling - level.elevation })),
    parentMap: source.parentMap,
    frame: { origin, width, depth, quarterTurns: site.quarterTurns },
    planarOrigin: [interior.x0, interior.z0],
    metresPerPlanarUnit: 1 / ROOM_SCALE,
  }
}
