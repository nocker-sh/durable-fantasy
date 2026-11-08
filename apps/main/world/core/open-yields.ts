import type { NodeDef } from "#/world/core/gather-types"

/** The results a spot can give at this level of the skill: the ones its practice has opened. */
export function openYields(node: NodeDef, level: number): NodeDef["yields"] {
  return node.yields.filter((yielded) => (yielded.level ?? 0) <= level)
}
