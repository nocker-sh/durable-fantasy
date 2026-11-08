import { nodeOf } from "#/world/core/node-of"
import type { NatureState } from "#/world/core/nature/types"
import { getRecoveredNode } from "#/world/core/nature/get-recovered-node"

/** How much a spot has now. */
export function leftAt(state: NatureState, id: string, now: number): number {
  const node = nodeOf(id)
  if (!node) return 0
  const stored = state.nodes[id]
  if (!stored) return node.max
  return getRecoveredNode({ node, stored, now }).left
}
