import { expect, it, vi } from "vitest"
import { updateScheduledResident } from "#/world/scene/runtime/update-scheduled-resident"

type Props = Parameters<typeof updateScheduledResident>[0]
const fixture = (): Props["actor"] => ({ pos: [1, 2], seat: null, anim: "idle", fig: { root: { visible: true } }, faceTo: vi.fn() })

it("preserves conversational facing when the access position does not change", () => {
  const actor = fixture()
  const original = actor.pos
  updateScheduledResident({ actor, position: [1, 2], pose: null, centre: [4, 5] })
  expect(actor.faceTo).not.toHaveBeenCalled()
  expect(actor.pos).toBe(original)
})

it("copies a changed access position before facing the centre", () => {
  const actor = fixture()
  const position: [number, number] = [2, 3]
  vi.mocked(actor.faceTo).mockImplementation(() => expect(actor.pos).toEqual(position))
  updateScheduledResident({ actor, position, pose: null, centre: [4, 5] })
  expect(actor.pos).toEqual(position)
  expect(actor.pos).not.toBe(position)
  expect(actor.faceTo).toHaveBeenCalledExactlyOnceWith([4, 5])
})

it("gives an authored facing precedence over the centre after moving", () => {
  const actor = fixture()
  const seat = { at: [2, 3] satisfies [number, number], height: 0.66, heading: Math.PI }
  updateScheduledResident({ actor, position: [2, 3], pose: { seat, facing: [6, 7] }, centre: [4, 5] })
  expect(actor.seat).toBe(seat)
  expect(actor.faceTo).toHaveBeenCalledExactlyOnceWith([6, 7])
})

it("hides absent residents, releases their seat and resets only a previously seated animation", () => {
  const actor = fixture()
  actor.seat = { at: [1, 2], height: 0.66, heading: 0 }
  actor.anim = "sit"
  updateScheduledResident({ actor, position: null, pose: null, centre: [4, 5] })
  expect(actor.fig.root.visible).toBe(false)
  expect(actor.seat).toBeNull()
  expect(actor.anim).toBe("idle")
  expect(actor.pos).toEqual([1, 2])
  actor.anim = "look"
  updateScheduledResident({ actor, position: null, pose: null, centre: [4, 5] })
  expect(actor.anim).toBe("look")
  expect(actor.faceTo).not.toHaveBeenCalled()
})
