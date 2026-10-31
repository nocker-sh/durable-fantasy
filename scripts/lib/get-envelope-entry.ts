import { z } from "zod"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

const cell = z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()])
const roomSchema = z.object({ origin: cell, door_leaves: z.array(z.object({ door: cell }).passthrough()) })
const leafSchema = doorLeafGeometrySchema.extend({
  thickness_m: z.number().positive(),
  frame_inset_m: z.number().nonnegative(),
  vertical_clearance_m: z.object({ bottom: z.number(), top: z.number() }).optional(),
})

/** An exterior entrance must resolve to one measured leaf, not the first of ambiguous definitions. */
export function getEnvelopeEntry(room: SettingDocument | undefined, door: readonly number[]) {
  const parsed = roomSchema.safeParse(room)
  if (!room || !parsed.success) throw new Error("Exterior door leaf or entry rail height is missing")
  const matches = parsed.data.door_leaves.filter((leaf) => leaf.door[0] === door[0] && leaf.door[1] === door[1])
  const leaf = leafSchema.safeParse(matches[0])
  if (matches.length !== 1 || !leaf.success) throw new Error("Exterior door leaf or entry rail height is missing")
  return { room, origin: parsed.data.origin, leaf: leaf.data }
}
