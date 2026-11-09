import { nodeOf } from "#/world/core/node-of"
import { getRecoveredNode } from "#/world/core/nature/get-recovered-node"
import type { NatureState } from "#/world/core/nature/types"

/** Give a go back (the gatherer could not take it after all). */
export function giveOne(state: NatureState, id: string, now: number): NatureState {
  const node = nodeOf(id)
  const stored = state.nodes[id]
  if (!node || !stored) return state
  const recovered = getRecoveredNode({ node, stored, now })
  const left = Math.min(node.max, recovered.left + 1)
  const at = left >= node.max ? now : recovered.at
  return { nodes: { ...state.nodes, [id]: { left, at } } }
}
