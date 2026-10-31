import { ScalarField } from "#/lib/engine/scalar-field"
import { MAPS } from "#/world/maps"
import { layoutOf } from "#/world/maps/layouts"
import { createGroundFields } from "#/world/maps/ground/create-ground-fields"
import { getWalkHeight } from "#/world/maps/ground/get-walk-height"
import { GN, FR } from "#/world/maps/ground/rules"
import { INTERIORS } from "#/world/town/interiors"
import { getInteriorFloorHeight } from "#/world/town/get-interior-floor-height"
import { getInteriorWalkSurfaces } from "#/world/town/get-interior-walk-surfaces"
import { getOutdoorWalkSurfaces } from "#/world/town/get-outdoor-walk-surfaces"
import type { MapWalkSampler, WalkSurface } from "#/world/maps/ground/types"

/** Own terrain and surface snapshots; reading one map never selects or mutates a rendered scene. */
export function createMapWalkSampler(mapId: string): MapWalkSampler {
  const map = Object.hasOwn(MAPS, mapId) ? MAPS[mapId] : undefined
  if (!map || map.id !== mapId) throw new Error(`Walk sampler map is missing or miskeyed: ${mapId}`)
  const interior = INTERIORS.find((room) => room.id === mapId)
  if (map.kind === "indoor" && !interior) throw new Error(`Walk sampler interior is missing: ${mapId}`)
  const source = layoutOf(mapId),
    field = new ScalarField(createGroundFields(source).h, GN, FR),
    groundHeight = (x: number, z: number) => field.sample(x, z),
    displayFloorHeight = interior ? getInteriorFloorHeight(interior, groundHeight) : 0
  const definitions = interior ? getInteriorWalkSurfaces(interior, displayFloorHeight) : getOutdoorWalkSurfaces(mapId)
  const surfaces: readonly WalkSurface[] = definitions.map((surface) => ({ rect: [surface.rect[0], surface.rect[1], surface.rect[2], surface.rect[3]], height: surface.height }))
  const bridge = { ...source.bridge }
  return Object.freeze({ mapId, displayFloorHeight, sample: (x: number, z: number) => getWalkHeight({ x, z, bridge, groundHeight, surfaces }) })
}
