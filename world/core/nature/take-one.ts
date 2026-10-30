import { nodeOf } from "#/world/core/node-of"
import { getRecoveredNode } from "#/world/core/nature/get-recovered-node"
import type { NatureState } from "#/world/core/nature/types"

/** Take one go from a spot; null when it is spent. */
export function takeOne(state: NatureState, id: string, now: number): NatureState | null {
  const node = nodeOf(id)
  if (!node) return null
  const stored = state.nodes[id]
  const recovered = stored ? getRecoveredNode({ node, stored, now }) : { left: node.max, at: now }
  if (recovered.left <= 0) return null
  // the clock for the next one to come back starts now if it was full, else keeps running
  const at = recovered.left >= node.max ? now : recovered.at
  return { nodes: { ...state.nodes, [id]: { left: recovered.left - 1, at } } }
}
