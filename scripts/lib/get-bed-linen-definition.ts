import type { bedLinenSchema } from "#/scripts/lib/bed-linen-schema"
import type { BedLinenItem } from "#/world/town/bed-types"
import type { z } from "zod"

/** Older authored frames can omit linen; measured pieces retain their individual IDs and head-relative positions. */
export function getBedLinenDefinition(value: z.infer<typeof bedLinenSchema> | null | undefined): readonly BedLinenItem[] | null {
  if (value === undefined || value === null) return null

  return value.map((piece) => ({
    id: piece.id,
    kind: piece.kind,
    across: piece.position_m[0],
    fromHead: piece.position_m[1],
    width: piece.width_m,
    length: piece.length_m,
    thickness: piece.thickness_m,
  }))
}
