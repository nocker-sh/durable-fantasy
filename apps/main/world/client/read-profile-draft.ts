import { draftSchema } from "#/world/client/profile-draft"
import type { ProfileDraft } from "#/world/client/profile-draft"

/** Drafts are optional; blocked storage must not prevent an existing session from editing. */
export function readProfileDraft(storage: Pick<Storage, "getItem">): ProfileDraft | null {
  try {
    const parsed = draftSchema.safeParse(JSON.parse(storage.getItem("durable-fantasy/profile-draft") ?? "null"))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
