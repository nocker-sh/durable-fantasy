import { expect, it, vi } from "vitest"
import { updateSceneWalkers } from "#/world/scene/runtime/update-scene-walkers"
import type { MotionWalker } from "#/world/scene/runtime/walker-motion-types"

function walker(): MotionWalker {
  return { pos: [0, 0], path: [], head: 0, t: 0, fig: { pose() {}, face() {}, refresh() {}, root: { position: { set() {} } } } }
}

function fixture() {
  const me = walker()
  const other = walker()
  const events: string[] = []
  const step = vi.fn((person: MotionWalker) => {
    events.push(person === me ? "step:me" : "step:other")
    if (person === me) person.path = []
    return true
  })
  const place = vi.fn((person: MotionWalker) => {
    events.push(person === me ? "place:me" : "place:other")
  })
  const stepHeld = vi.fn(() => {
    events.push("held")
  })
  const arrive = vi.fn(() => {
    events.push("arrive")
  })
  const props = { me, remotes: new Map([["other", other]]), preview: false, frame: { at: 10, dt: 0.05, elapsed: 1, time: 3 }, step, place, stepHeld, arrive }
  return { props, events, other }
}

it("consumes arrival before held input and preserves the new path until the next frame", () => {
  const f = fixture()
  f.props.me.path = [[1, 0]]
  f.props.arrive.mockImplementation(() => {
    f.events.push("arrive")
    f.props.me.path = [[2, 0]]
  })
  updateSceneWalkers(f.props)
  expect(f.events).toEqual(["held", "step:me", "arrive", "held", "place:me", "step:other", "place:other"])
  expect(f.props.step).toHaveBeenCalledWith(f.props.me, 0.05, 1)
  expect(f.props.step).toHaveBeenCalledWith(f.other, 0.05, 1)
  expect(f.props.me.path).toEqual([[2, 0]])
})

it("does not report arrival for a frame that started without a path", () => {
  const f = fixture()
  updateSceneWalkers(f.props)
  expect(f.props.arrive).not.toHaveBeenCalled()
  expect(f.props.stepHeld).toHaveBeenCalledTimes(2)
})

it("keeps the preview's held-input call after movement", () => {
  const f = fixture()
  f.props.preview = true
  updateSceneWalkers(f.props)
  expect(f.events).toEqual(["step:me", "held", "place:me", "step:other", "place:other"])
})

it("uses the live remote collection after the arrival callback", () => {
  const f = fixture()
  f.props.me.path = [[1, 0]]
  f.props.arrive.mockImplementation(() => f.props.remotes.clear())
  updateSceneWalkers(f.props)
  expect(f.props.step).toHaveBeenCalledTimes(1)
  expect(f.props.place).toHaveBeenCalledTimes(1)
})
