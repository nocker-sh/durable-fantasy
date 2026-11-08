import { TILE_M } from "#/world/town/fit"
import type { BuildingEnvelope } from "#/world/town/building-envelope"
import type { GableRoof } from "#/lib/engine/gable-roof-types"

/** Envelope roof heights describe the clear underside; convert outdoor tiles to metres exactly once. */
export function getBuildingEnvelopeRoof(site: BuildingEnvelope): GableRoof {
  if (
    ![...site.bounds, site.floorY, site.eaveY, site.ridgeY, site.overhang].every(Number.isFinite) ||
    site.eaveY <= site.floorY ||
    site.ridgeY < site.eaveY ||
    site.overhang < 0 ||
    (site.ridgeAxis !== "x" && site.ridgeAxis !== "z")
  )
    throw new Error(`Invalid authored roof envelope: ${site.id}`)
  const bounds = { x0: site.bounds[0] * TILE_M, z0: site.bounds[1] * TILE_M, x1: site.bounds[2] * TILE_M, z1: site.bounds[3] * TILE_M }
  const floor = site.floorY * TILE_M,
    eave = site.eaveY * TILE_M,
    ridge = site.ridgeY * TILE_M,
    overhang = site.overhang * TILE_M
  if (
    ![...Object.values(bounds), floor, eave, ridge, overhang, ridge - eave, bounds.x1 - bounds.x0, bounds.z1 - bounds.z0].every(Number.isFinite) ||
    eave <= floor ||
    bounds.x1 <= bounds.x0 ||
    bounds.z1 <= bounds.z0
  )
    throw new Error(`Invalid authored roof envelope: ${site.id}`)
  return { bounds, eave, ridge, overhang, ridgeAxis: site.ridgeAxis }
}
