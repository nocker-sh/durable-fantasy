import { z } from "zod"
import { LOOK_COUNT, NAME_MAX, NECK_KINDS, NECK_RAMPS } from "../core/player.ts"

const draftSchema = z.object({
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

/** Drafts are optional; blocked storage must not prevent an existing session from editing. */
export function readProfileDraft(storage: Pick<Storage, "getItem">): ProfileDraft | null {
  try {
    const parsed = draftSchema.safeParse(JSON.parse(storage.getItem("durable-fantasy/profile-draft") ?? "null"))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function writeProfileDraft(storage: Pick<Storage, "setItem" | "removeItem">, draft: ProfileDraft | null) {
  try {
    if (draft) storage.setItem("durable-fantasy/profile-draft", JSON.stringify(draft))
    else storage.removeItem("durable-fantasy/profile-draft")
  } catch {
    // The current form remains usable even when drafts cannot be stored.
  }
}
