import { FURNITURE_KINDS } from "#/world/town/furniture-kinds"
import type { FurnitureKind } from "#/world/town/furniture-kinds"

/** Explicit authored renderer names are strict; unknown names must not select a fallback shape. */
export function parseFurnitureKind(value: string): FurnitureKind {
  const kind = FURNITURE_KINDS.find((kind) => kind === value)
  if (!kind) throw new Error(`Unknown furniture kind: ${value}`)

  return kind
}
