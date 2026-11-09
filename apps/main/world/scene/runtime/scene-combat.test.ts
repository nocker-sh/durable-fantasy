import { describe, expect, it, vi } from "vitest"
import { SceneCombat } from "#/world/scene/runtime/scene-combat"
import { PendingAction } from "#/world/scene/runtime/action-target"
import { approachMonster } from "#/world/scene/approach-monster"
import type { V2 } from "#/world/scene/construction/registry"

vi.mock("#/world/scene/approach-monster", () => ({ approachMonster: vi.fn(() => false) }))

function setup() {
  const action = new PendingAction<unknown>()
  const me: { pos: V2; path: V2[]; head: number; fig: { face: (heading: number) => void } } = { pos: [0, 0], path: [], head: 0, fig: { face: vi.fn() } }
  const target: { pos: V2; body: { visible: boolean }; spawn: { id: string } } = { pos: [0, 1], body: { visible: true }, spawn: { id: "first" } }
  const movement = { frozen: false, walkTo: vi.fn(() => true) }
  const events: string[] = []
  const onWalk = vi.fn(() => {
    events.push("walk")
  })
  const playSwing = vi.fn(() => {
    events.push("animation")
  })
  const onSwing = vi.fn(() => {
    events.push("swing")
  })
  const combat = new SceneCombat({ monsters: [target], me, action, movement, onWalk, playSwing, onSwing })
  return { combat, action, me, target, movement, events, onWalk, playSwing, onSwing }
}

describe("SceneCombat", () => {
  it("keeps the current action when selecting during a freeze", () => {
    const s = setup()
    s.action.select({ kind: "spot", id: "herbs" })
    s.movement.frozen = true
    s.combat.fight("first")
    expect(s.action.current).toEqual({ kind: "spot", id: "herbs" })
  })

  it("preserves missing targets but ends an invisible target", () => {
    const s = setup()
    s.combat.fight("missing")
    s.combat.update(5000)
    expect(s.action.fighting).toBe("missing")
    s.combat.fight("first")
    s.target.body.visible = false
    s.combat.update(5000)
    expect(s.action.fighting).toBeNull()
    expect(s.onSwing).not.toHaveBeenCalled()
  })

  it("throttles unsuccessful pursuit with a strict boundary and keeps the reservation", () => {
    vi.mocked(approachMonster).mockClear()
    const s = setup()
    s.target.pos = [20, 20]
    s.combat.fight("first")
    s.combat.update(600)
    expect(approachMonster).not.toHaveBeenCalled()
    s.combat.update(601)
    s.combat.update(1201)
    expect(approachMonster).toHaveBeenCalledTimes(1)
    s.combat.update(1202)
    expect(approachMonster).toHaveBeenCalledTimes(2)
    const request = vi.mocked(approachMonster).mock.calls.at(-1)?.[0]
    request?.tryWalk([1, 2])
    expect(s.movement.walkTo).toHaveBeenCalledWith([1, 2], true)
    expect(s.action.fighting).toBe("first")
  })

  it("stops surplus path before animating and sending a strike without clearing the fight", () => {
    const s = setup()
    s.me.path = [
      [0.25, 0.25],
      [0.25, 0.75],
    ]
    s.combat.fight("first")
    s.combat.update(1500)
    expect(s.me.path).toEqual([[0.25, 0.25]])
    expect(s.onWalk).toHaveBeenCalledWith([[0, 0]])
    expect(s.events).toEqual(["walk", "animation", "swing"])
    expect(s.me.fig.face).toHaveBeenCalledWith(0)
    expect(s.action.fighting).toBe("first")
    expect(s.onSwing).toHaveBeenCalledWith("first")
  })

  it("faces on every close frame and allows a strike exactly at the configured delay", () => {
    const s = setup()
    s.combat.setAttackDelay(1000)
    s.combat.fight("first")
    s.combat.update(999)
    expect(s.me.fig.face).toHaveBeenCalledTimes(1)
    expect(s.onSwing).not.toHaveBeenCalled()
    s.combat.update(1000)
    s.combat.update(1999)
    expect(s.onSwing).toHaveBeenCalledTimes(1)
    s.combat.update(2000)
    expect(s.onSwing).toHaveBeenCalledTimes(2)
  })

  it("does not reset attack cooldown when selecting a target again", () => {
    const s = setup()
    s.combat.fight("first")
    s.combat.update(1500)
    s.combat.fight("first")
    s.combat.update(1501)
    expect(s.onSwing).toHaveBeenCalledTimes(1)
  })
})
