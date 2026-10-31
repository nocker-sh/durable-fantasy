import { expect, it, vi } from "vitest"
import { SceneCombatFeedback } from "#/world/scene/runtime/scene-combat-feedback"
import type { V2 } from "#/world/scene/construction/registry"
import type { Spawn } from "#/world/core/monster-types"
import type { SceneHitLabels } from "#/world/scene/runtime/scene-hit-labels"

function fixture() {
  const spawn: Spawn = { id: "creature", map: "south-meadow", kind: "slime", area: [0, 0, 4, 4] }
  const pos: V2 = [2, 3]
  const monster = { spawn, pos, hp: 10, back: 20 }
  const me = { pos, fig: { height: 2 } }
  const remotePosition: V2 = [5, 6]
  const other = { pos: remotePosition, fig: { height: 3 } }
  const remotes = new Map([["other", other]])
  const show = vi.fn<SceneHitLabels["show"]>()
  const defeated = vi.fn<(target: typeof monster) => void>()
  const feedback = new SceneCombatFeedback({ monsters: [monster], me, remotes, labels: { show }, defeated })
  return { monster, me, remotes, show, defeated, feedback }
}

it("applies authoritative snapshots, including zeroes, without creating unknown creatures", () => {
  const f = fixture()
  f.feedback.setWild({ creature: { hp: 0, back: 0 }, unknown: { hp: 9, back: 99 } })
  expect([f.monster.hp, f.monster.back]).toEqual([0, 0])
  f.feedback.setWild({})
  expect([f.monster.hp, f.monster.back]).toEqual([0, 0])
  expect(f.show).not.toHaveBeenCalled()
  expect(f.defeated).not.toHaveBeenCalled()
})

it("updates state before defeat and shows the hit after the defeat callback", () => {
  const f = fixture()
  const events: string[] = []
  f.defeated.mockImplementation((monster) => {
    expect(monster).toBe(f.monster)
    expect([monster.hp, monster.back]).toEqual([0, 100])
    events.push("defeated")
  })
  f.show.mockImplementation(() => {
    events.push("shown")
  })
  f.feedback.struck({ id: "creature", kind: "critical", damage: 12, hp: 0, back: 100 })
  expect(events).toEqual(["defeated", "shown"])
  expect(f.show).toHaveBeenCalledExactlyOnceWith({ kind: "critical", text: "12", pos: f.monster.pos, height: 0.5 })
})

it("retains current HP for a sentinel and the return time when an attack supplies zero", () => {
  const f = fixture()
  f.feedback.struck({ id: "creature", kind: "miss", damage: 0, hp: -1, back: 0 })
  expect([f.monster.hp, f.monster.back]).toEqual([10, 20])
  expect(f.defeated).not.toHaveBeenCalled()
  expect(f.show).toHaveBeenCalledExactlyOnceWith({ kind: "miss", text: "ミス", pos: f.monster.pos, height: 0.5 })
})

it("shows an ordinary hit without issuing defeat and ignores missing targets", () => {
  const f = fixture()
  f.feedback.struck({ id: "creature", kind: "hit", damage: 3, hp: 7, back: 0 })
  f.feedback.struck({ id: "missing", kind: "hit", damage: 9, hp: 0, back: 100 })
  expect(f.monster.hp).toBe(7)
  expect(f.show).toHaveBeenCalledExactlyOnceWith({ kind: "hit", text: "3", pos: f.monster.pos, height: 0.5 })
  expect(f.defeated).not.toHaveBeenCalled()
})

it("uses the current local figure height and position for taken damage and evasion", () => {
  const f = fixture()
  f.feedback.hurt("me", "critical", 4)
  expect(f.show).toHaveBeenLastCalledWith({ kind: "taken", text: "4", pos: [2, 3], height: 1.8 })
  f.me.fig = { height: 4 }
  f.me.pos = [8, 9]
  f.feedback.hurt("me", "miss", 0)
  expect(f.show).toHaveBeenLastCalledWith({ kind: "miss", text: "かわした", pos: [8, 9], height: 3.6 })
})

it("finds remote players at notification time and ignores departures", () => {
  const f = fixture()
  f.feedback.hurt("other", "hit", 5)
  expect(f.show).toHaveBeenCalledExactlyOnceWith({ kind: "taken", text: "5", pos: [5, 6], height: 2.7 })
  f.remotes.delete("other")
  f.feedback.hurt("other", "miss", 0)
  f.feedback.hurt("missing", "hit", 4)
  expect(f.show).toHaveBeenCalledOnce()
})
