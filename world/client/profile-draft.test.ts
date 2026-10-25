import { expect, it } from "vitest"
import { readProfileDraft, writeProfileDraft } from "./profile-draft.ts"

it("restores an interrupted draft and removes it after confirmation", () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => {
      values.set(k, v)
    },
    removeItem: (k: string) => {
      values.delete(k)
    },
  }
  const draft = { name: "", look: 3, neck: "scarf" as const, ramp: "cGreen" as const }
  writeProfileDraft(storage, draft)
  expect(readProfileDraft(storage)).toEqual(draft)
  writeProfileDraft(storage, null)
  expect(readProfileDraft(storage)).toBeNull()
})

it("ignores corrupted drafts and unavailable storage", () => {
  expect(readProfileDraft({ getItem: () => "{" })).toBeNull()
  expect(readProfileDraft({ getItem: () => '{"look":999}' })).toBeNull()
  const blocked = () => {
    throw new Error("unavailable")
  }
  expect(readProfileDraft({ getItem: blocked })).toBeNull()
  expect(() => writeProfileDraft({ setItem: blocked, removeItem: blocked }, null)).not.toThrow()
})
