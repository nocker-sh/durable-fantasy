import { MAPS } from "#/world/maps"
import { WORLD_NODES } from "#/world/maps/world-map"
import type { WorldNode } from "#/world/maps/world-map-types"

/** Each road between two maps once. */
export function worldRoads(): [WorldNode, WorldNode][] {
  const roads: [WorldNode, WorldNode][] = []
  for (const fromNode of WORLD_NODES)
    for (const warp of MAPS[fromNode.id]?.warps ?? []) {
      const toNode = WORLD_NODES.find((candidate) => candidate.id === warp.to.map)
      if (toNode && fromNode.id < toNode.id) roads.push([fromNode, toNode])
    }
  return roads
}
