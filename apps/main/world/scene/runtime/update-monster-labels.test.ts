import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { Group } from "three"
import { updateMonsterLabels } from "#/world/scene/runtime/update-monster-labels"
import { MONSTER_KINDS } from "#/world/core/monsters"
import type { Spawn } from "#/world/core/monster-types"
import type { V2 } from "#/world/scene/construction/registry"
import type { SceneLabelProjection } from "#/world/scene/runtime/scene-label-projection"

beforeEach(() => vi.stubGlobal("document", { createElement: () => ({ style: { width: "" } }) }))
afterEach(() => vi.unstubAllGlobals())

function fixture() {
  const spawn: Spawn = { id: "creature", map: "field", kind: "slime", area: [0, 0, 1, 1] }
  const pos: V2 = [4, 0]
  const me: { pos: V2 } = { pos: [0, 0] }
  const monster = { spawn, pos, body: new Group(), hp: MONSTER_KINDS.slime.hp, hpBar: document.createElement("span"), label: document.createElement("div"), groundHeight: 3 }
  const action: { fighting: string | null } = { fighting: null }
  const place = vi.fn<SceneLabelProjection["place"]>()
  return { monster, me, action, place, input: { monsters: [monster], me, action, place } }
}

it("uses a strict proximity boundary for a healthy untargeted creature", () => {
  const f = fixture()
  updateMonsterLabels(f.input)
  expect(f.place).toHaveBeenLastCalledWith({ element: f.monster.label, visible: false, pos: f.monster.pos, height: 0.55, ground: 3, offset: 2 })
  f.monster.pos = [3.999, 0]
  updateMonsterLabels(f.input)
  expect(f.place.mock.calls[1][0].visible).toBe(true)
  f.me.pos = [-1, 0]
  updateMonsterLabels(f.input)
  expect(f.place.mock.calls[2][0].visible).toBe(false)
})

it("shows a distant selected or injured creature while keeping full health unselected names hidden", () => {
  const f = fixture()
  f.monster.pos = [10, 0]
  f.action.fighting = "creature"
  updateMonsterLabels(f.input)
  expect(f.place.mock.calls[0][0].visible).toBe(true)
  f.action.fighting = "different"
  f.monster.hp--
  updateMonsterLabels(f.input)
  expect(f.place.mock.calls[1][0].visible).toBe(true)
  f.monster.hp = MONSTER_KINDS.slime.hp
  updateMonsterLabels(f.input)
  expect(f.place.mock.calls[2][0].visible).toBe(false)
})

it("hides absent bodies but synchronizes HP before projecting the label", () => {
  const f = fixture()
  f.monster.body.visible = false
  f.monster.hp = 0
  f.action.fighting = "creature"
  f.place.mockImplementation((placement) => {
    expect(f.monster.hpBar.style.width).toBe("0%")
    expect(placement.visible).toBe(false)
  })
  updateMonsterLabels(f.input)
  expect(f.place).toHaveBeenCalledOnce()
})
