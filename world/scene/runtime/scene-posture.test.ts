import { afterEach, expect, it, vi } from "vitest"
import { ScenePosture } from "#/world/scene/runtime/scene-posture"
import type { WalkerAction } from "#/world/scene/runtime/walker-motion-types"
import type { V2 } from "#/world/scene/construction/registry"

afterEach(() => vi.restoreAllMocks())

function fixture() {
  const pos: V2 = [2, 3]
  const me = { pos, head: 0, fig: { face: vi.fn<(heading: number) => void>() } }
  const walkers: { me: typeof me; action: WalkerAction | null } = { me, action: null }
  const freeze = vi.fn<(on: boolean) => void>()
  const endFight = vi.fn()
  return { walkers, freeze, endFight, posture: new ScenePosture({ walkers, freeze, endFight }) }
}

it("faces the action cell before scheduling the temporary pose", () => {
  const f = fixture()
  vi.spyOn(performance, "now").mockReturnValue(100)
  f.walkers.me.fig.face.mockImplementation((head: number) => {
    expect(f.walkers.me.head).toBe(head)
    expect(f.walkers.action).toBeNull()
  })
  const play = f.posture.playAction
  play("chop", [8, 6])
  expect(f.walkers.me.head).toBeCloseTo(Math.atan2(2.25, 0.25))
  expect(f.walkers.me.fig.face).toHaveBeenCalledExactlyOnceWith(f.walkers.me.head)
  expect(f.walkers.action).toEqual({ anim: "chop", until: 1500 })
  expect(f.freeze).not.toHaveBeenCalled()
})

it("uses the replacement player position for the next temporary action", () => {
  const f = fixture()
  vi.spyOn(performance, "now").mockReturnValue(200)
  f.walkers.me.pos = [10, 20]
  f.posture.playAction("hammer", [4, 6])
  expect(f.walkers.me.head).toBeCloseTo(Math.atan2(-7.75, -16.75))
  expect(f.walkers.action).toEqual({ anim: "hammer", until: 1600 })
})

it("freezes and ends a fight before taking the fallen pose and ignores repeated notifications", () => {
  const f = fixture()
  const events: string[] = []
  f.freeze.mockImplementation((on) => {
    events.push("freeze")
    expect(on).toBe(true)
    expect(f.walkers.action).toBeNull()
  })
  f.endFight.mockImplementation(() => {
    events.push("end")
    expect(f.walkers.action).toBeNull()
  })
  f.posture.setDown(false)
  f.posture.setDown(true)
  f.posture.setDown(true)
  expect(events).toEqual(["freeze", "end"])
  expect(f.walkers.action).toEqual({ anim: "sit", until: Infinity })
})

it("records the down transition before notifying movement so a repeated callback cannot recurse", () => {
  const f = fixture()
  f.freeze.mockImplementation(() => f.posture.setDown(true))
  f.posture.setDown(true)
  expect(f.freeze).toHaveBeenCalledOnce()
  expect(f.endFight).toHaveBeenCalledOnce()
})

it("unfreezes and clears the temporary pose on recovery without ending another fight", () => {
  const f = fixture()
  f.posture.setDown(true)
  f.posture.setDown(false)
  f.posture.setDown(false)
  expect(f.freeze.mock.calls).toEqual([[true], [false]])
  expect(f.endFight).toHaveBeenCalledOnce()
  expect(f.walkers.action).toBeNull()
})

it("changes sitting without freezing movement and ignores sitting updates while down", () => {
  const f = fixture()
  f.posture.setSitting(true)
  expect(f.walkers.action).toEqual({ anim: "sit", until: Infinity })
  expect(f.freeze).not.toHaveBeenCalled()
  f.walkers.action = { anim: "chop", until: 10 }
  f.posture.setSitting(true)
  expect(f.walkers.action).toEqual({ anim: "chop", until: 10 })
  f.posture.setSitting(false)
  expect(f.walkers.action).toBeNull()
  f.posture.setDown(true)
  f.posture.setSitting(true)
  f.posture.setSitting(false)
  expect(f.walkers.action).toEqual({ anim: "sit", until: Infinity })
  f.posture.setDown(false)
  f.posture.setSitting(true)
  expect(f.walkers.action).toEqual({ anim: "sit", until: Infinity })
})
