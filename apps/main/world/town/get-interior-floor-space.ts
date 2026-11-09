import { flueFloor } from "#/world/town/flue-floor"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import type { Interior } from "#/world/town/interiors"
import type { MapFloorSpace } from "#/world/maps/floor-space-types"

/** Read the renderer's timber and stone sections, retaining the declared thickness and every opening in metric local coordinates. */
export function getInteriorFloorSpace(interior: Interior, thicknessMetres: number): MapFloorSpace {
  if (
    !Number.isFinite(thicknessMetres) ||
    thicknessMetres <= 0 ||
    typeof interior.floorThickness !== "number" ||
    !Number.isFinite(interior.floorThickness) ||
    Math.abs(interior.floorThickness / ROOM_SCALE - thicknessMetres) > 1e-6
  )
    throw new Error(`Interior floor thickness disagrees: ${interior.id}`)
  for (const cut of [...(interior.floorOpenings ?? []), ...(interior.flues ?? [])])
    if (![cut.x0, cut.z0, cut.x1, cut.z1].every(Number.isFinite) || cut.x1 <= cut.x0 || cut.z1 <= cut.z0) throw new Error(`Invalid interior floor opening: ${interior.id}`)
  const parts = flueFloor({ bounds: interior, floor: interior.floor, flues: interior.flues ?? [], openings: interior.floorOpenings ?? [] })
  return {
    thicknessMetres,
    footprint: [...parts.timber, ...parts.stone].map((rect) => ({
      x0: (rect.x0 - interior.x0) / ROOM_SCALE,
      z0: (rect.z0 - interior.z0) / ROOM_SCALE,
      x1: (rect.x1 - interior.x0) / ROOM_SCALE,
      z1: (rect.z1 - interior.z0) / ROOM_SCALE,
    })),
  }
}
