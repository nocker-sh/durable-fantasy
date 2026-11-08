import { MAPS } from "#/world/maps"
import { WORLD_NODES } from "#/world/maps/world-map"
import type { WorldNode } from "#/world/maps/world-map-types"

/** 上階でも屋内の接続を辿って建物のある通りを示し、循環した接続では戻り続けない。 */
export function worldNodeOf(mapId: string): WorldNode | undefined {
  const pending = [mapId]
  const visited = new Set<string>()
  while (pending.length) {
    const currentId = pending.shift()
    if (currentId === undefined || visited.has(currentId)) continue
    visited.add(currentId)
    const node = WORLD_NODES.find((candidate) => candidate.id === currentId)
    if (node) return node
    const map = MAPS[currentId]
    if (map?.kind !== "indoor") continue
    for (const warp of map.warps) pending.push(warp.to.map)
  }
  return undefined
}
