import type { V2 } from "#/world/scene/construction/registry"
import type { Side } from "#/world/scene/construction/houses"

/** The middle of a side of a house at the ground, and its length. */
export function sideOf(h: { x0: number; z0: number; x1: number; z1: number }, side: Side): { c: V2; len: number } {
  if (side === "s") return { c: [(h.x0 + h.x1) / 2, h.z1], len: h.x1 - h.x0 }
  if (side === "n") return { c: [(h.x0 + h.x1) / 2, h.z0], len: h.x1 - h.x0 }
  if (side === "e") return { c: [h.x1, (h.z0 + h.z1) / 2], len: h.z1 - h.z0 }
  return { c: [h.x0, (h.z0 + h.z1) / 2], len: h.z1 - h.z0 }
}
