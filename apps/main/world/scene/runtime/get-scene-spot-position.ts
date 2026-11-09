import type { Spot } from "#/world/town/routine-types"
import type { V2 } from "#/world/scene/construction/registry"

/** 別のマップの地点を描かず、セルの中心だけを地面の座標へ直す。 */
export function getSceneSpotPosition(spot: Spot | null, map: string, places: Readonly<Record<string, V2>>): V2 | null {
  if (!spot || spot.map !== map) return null
  if ("place" in spot) return places[spot.place] ?? null
  if ("tile" in spot) return [spot.tile[0], spot.tile[1]]
  return [(spot.cell[0] + 0.5) / 2, (spot.cell[1] + 0.5) / 2]
}
