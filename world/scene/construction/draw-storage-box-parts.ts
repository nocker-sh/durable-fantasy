import type { StorageBoxPart } from "#/world/town/storage-box-types"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"

/** A staged box and cover use the exact same pieces and materials as their closed state. */
export function drawStorageBoxParts(builder: GB, parts: readonly StorageBoxPart[], material: "wood" | "iron" = "wood") {
  for (const part of parts)
    builder.box({
      side: material === "iron" ? M.iron : M.woodDark,
      top: material === "iron" ? M.iron : M.wood,
      x0: part.x0,
      y0: part.y0,
      z0: part.z0,
      x1: part.x1,
      y1: part.y1,
      z1: part.z1,
      repeat: 1,
      bottom: true,
    })
}
