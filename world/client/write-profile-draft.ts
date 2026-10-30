import type { ProfileDraft } from "#/world/client/profile-draft"

export function writeProfileDraft(storage: Pick<Storage, "setItem" | "removeItem">, draft: ProfileDraft | null) {
  try {
    if (draft) storage.setItem("durable-fantasy/profile-draft", JSON.stringify(draft))
    else storage.removeItem("durable-fantasy/profile-draft")
  } catch {
    // The current form remains usable even when drafts cannot be stored.
  }
}
