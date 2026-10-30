import { z } from "zod"
import { LOOK_COUNT, NAME_MAX, NECK_KINDS, NECK_RAMPS } from "#/world/core/player-rules"

export const draftSchema = z.object({
  name: z.string().max(NAME_MAX),
  look: z
    .number()
    .int()
    .min(0)
    .max(LOOK_COUNT - 1),
  neck: z.enum(NECK_KINDS),
  ramp: z.enum(NECK_RAMPS),
})

export type ProfileDraft = z.infer<typeof draftSchema>
