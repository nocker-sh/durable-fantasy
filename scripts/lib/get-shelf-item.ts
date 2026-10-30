import { shelfItemSchema } from "#/scripts/lib/shelf-item-schema"
import type { ShelfItem } from "#/world/town/shelf"

/** Keep authored input untrusted until its shape and cross-field restrictions have been checked. */
export function getShelfItem(value: unknown): ShelfItem | Error {
  const parsed = shelfItemSchema.safeParse(value)

  if (parsed.success) return parsed.data

  if (parsed.error.issues.some((issue) => issue.path[0] === "box_material")) return new Error("Invalid storage box material")
  if (parsed.error.issues.some((issue) => issue.path[0] === "lid_handle")) return new Error("Invalid storage box lid handle")
  if (parsed.error.issues.some((issue) => issue.path[0] === "tool")) return new Error("Invalid stored tool dimensions")
  if (parsed.error.issues.some((issue) => issue.path[0] === "retrieval")) return new Error("Invalid shelf retrieval")

  return new Error("Invalid shelf contents")
}
