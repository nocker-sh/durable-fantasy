import { describe, expect, it } from "vitest"
import { commandSchema } from "#/world/core/commands"
import { apply } from "#/world/core/apply"
import { loadPlayer } from "#/world/core/load-player"
import { newPlayer } from "#/world/core/new-player"
import { profileNameSchema } from "#/world/core/player-schema"

describe("character creation", () => {
  it("keeps creation pending until a saved profile is accepted", () => {
    const fresh = newPlayer()
    expect(loadPlayer(fresh).profileComplete).toBe(false)
    const command = commandSchema.parse({ type: "profile", name: "  A\u0308nne  ", look: 3, neck: "scarf", neckRamp: "cGreen" })
    const result = apply(fresh, command)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(loadPlayer(result.state)).toMatchObject({ profileComplete: true, name: "Änne", look: 3, neck: "scarf", neckRamp: "cGreen", gold: fresh.gold, bag: fresh.bag })
  })

  it("does not force existing saves through creation or change their belongings", () => {
    const { profileComplete: _, ...legacy } = newPlayer("既存の名前", 2)
    expect(loadPlayer(legacy)).toMatchObject({ ...legacy, profileComplete: true })
  })

  it.each(["", "   ", "a\nb", "a\u0000b", "\u202Ename", "\u200B", "a".repeat(17), "\uD800"])("rejects unsafe or invalid name %j", (name) => {
    expect(profileNameSchema.safeParse(name).success).toBe(false)
  })

  it.each(["名前", "Änne", "李 明", "a".repeat(16)])("accepts visible Unicode name %s", (name) => {
    expect(profileNameSchema.parse(name)).toBe(name)
  })

  it("rejects fabricated appearances", () => {
    for (const patch of [{ look: -1 }, { look: 8 }, { look: 0.5 }, { neck: "invalid" }, { neckRamp: "invalid" }]) {
      expect(commandSchema.safeParse({ type: "profile", name: "Erik", look: 0, neck: "muffler", neckRamp: "cRed", ...patch }).success).toBe(false)
    }
  })
})
