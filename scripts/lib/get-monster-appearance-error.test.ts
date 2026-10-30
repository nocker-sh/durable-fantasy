import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { getMonsterAppearanceError } from "#/scripts/lib/get-monster-appearance-error"
import { readSetting } from "#/scripts/lib/read-setting"
import { MONSTER_KINDS } from "#/world/core/monsters"
const appearance = {
  look: "slime",
  color: null,
  size: null,
  shape_source: "world/core/monster-body-shapes.ts",
  footprint_source: "world/core/get-monster-body-radius.ts",
  movement_clearance: "walk_grid_adopted",
}
it.each(Object.entries(MONSTER_KINDS))("matches %s's individual setting to its actual shape definition", (id, kind) => {
  const setting = readSetting(readFileSync(new URL(`../../.docs/settings/monsters/monster-${id}.md`, import.meta.url), "utf8"))
  expect(getMonsterAppearanceError({ appearance: setting.appearance, kind })).toBeNull()
})
it("rejects stale tuning and clearance claims without the adopted walk-grid scope", () => {
  expect(getMonsterAppearanceError({ appearance: { ...appearance, size: 2 }, kind: { look: "slime" } })).toEqual(new Error("Monster appearance disagrees with its registered definition"))
  expect(getMonsterAppearanceError({ appearance: { ...appearance, movement_clearance: "verified" }, kind: { look: "slime" } })).toEqual(
    new Error("Monster appearance needs shared shape and walk-grid clearance metadata"),
  )
})
