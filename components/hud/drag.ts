import { z } from "zod"
import { SLOTS } from "#/world/core/items/kinds"
import { BAG_SIZE } from "#/world/core/bag-rules"
import { itemId, stackSchema } from "#/world/core/player-schema"
import { SKILL_IDS } from "#/world/core/skill-ids"

export const ITEM_DRAG = "application/x-ui-item"

export const dragSourceSchema = z.union([
  z
    .object({
      item: itemId,
      slot: z
        .number()
        .int()
        .min(0)
        .max(BAG_SIZE - 1),
      stack: stackSchema,
    })
    .strict()
    .refine((s) => s.item === s.stack.item),
  z
    .object({ item: itemId, worn: z.enum(SLOTS), stack: stackSchema })
    .strict()
    .refine((s) => s.item === s.stack.item && s.stack.count === 1),
  z.object({ skill: z.enum(SKILL_IDS) }).strict(),
])

export type DragSource = z.infer<typeof dragSourceSchema>
