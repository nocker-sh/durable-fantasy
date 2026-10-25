// The town's gathering spots and how much each has left (economy.md §1): shared by everyone in the
// town, spent by gathering, coming back one at a time. Brought up to date lazily, like the market.
import { nodeOf } from "./gather.ts"

export interface NatureState {
  nodes: Record<string, { left: number; at: number }>
}

export const emptyNature = (): NatureState => ({ nodes: {} })

/** How much a spot has now. */
export function leftAt(state: NatureState, id: string, now: number): number {
  const node = nodeOf(id)
  if (!node) return 0
  const s = state.nodes[id]
  if (!s) return node.max
  const back = Math.floor((now - s.at) / (node.regen * 60_000))
  return Math.min(node.max, s.left + back)
}

/** Take one go from a spot; null when it is spent. */
export function takeOne(state: NatureState, id: string, now: number): NatureState | null {
  const node = nodeOf(id)
  if (!node) return null
  const left = leftAt(state, id, now)
  if (left <= 0) return null
  // the clock for the next one to come back starts now if it was full, else keeps running
  const prev = state.nodes[id]
  const at = !prev || left >= node.max ? now : prev.at + Math.floor((now - prev.at) / (node.regen * 60_000)) * node.regen * 60_000
  return { nodes: { ...state.nodes, [id]: { left: left - 1, at } } }
}

/** Give a go back (the gatherer could not take it after all). */
export function giveOne(state: NatureState, id: string, now: number): NatureState {
  const node = nodeOf(id)
  const s = state.nodes[id]
  if (!node || !s) return state
  return { nodes: { ...state.nodes, [id]: { left: Math.min(node.max, leftAt(state, id, now) + 1), at: s.at } } }
}
