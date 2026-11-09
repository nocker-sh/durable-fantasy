import { expect, it, vi } from "vitest"
import { SceneResidentConversation } from "#/world/scene/runtime/scene-resident-conversation"
import type { V2 } from "#/world/scene/construction/registry"

function fixture() {
  const me = { pos: [2, 3] satisfies V2, head: -1 }
  const person = { pos: [5, 7] satisfies V2, faceTo: vi.fn<(position: V2) => void>() }
  const marker = { visible: true }
  const notify = vi.fn<(id: number) => void>()
  const controls = new SceneResidentConversation({ me, marker, personOf: (id) => (id === 17 ? person : undefined), idOf: (candidate) => (candidate === person ? 17 : null), onReach: notify })
  return { me, person, marker, notify, controls }
}

it("faces both participants and hides the marker before notifying the original resident id", () => {
  const request = fixture()
  request.notify.mockImplementation((id) => {
    expect(id).toBe(17)
    expect(request.marker.visible).toBe(false)
    expect(request.person.faceTo).toHaveBeenCalledExactlyOnceWith(request.me.pos)
    expect(request.me.head).toBe(Math.atan2(3, 4))
  })
  const reach = request.controls.reach
  reach(request.person)
  expect(request.notify).toHaveBeenCalledOnce()
  expect(Object.isFrozen(request.controls)).toBe(true)
})

it("uses live positions when facing again without notifying another arrival", () => {
  const request = fixture()
  request.person.pos = [-4, 3]
  request.me.pos = [2, -3]
  const face = request.controls.faceResident
  face(17)
  expect(request.me.head).toBe(Math.atan2(-6, 6))
  expect(request.person.faceTo).toHaveBeenCalledExactlyOnceWith(request.me.pos)
  expect(request.marker.visible).toBe(true)
  expect(request.notify).not.toHaveBeenCalled()
})

it("ignores unknown ids and never notifies an unregistered actor as an undefined id", () => {
  const request = fixture()
  request.controls.faceResident(99)
  expect(request.me.head).toBe(-1)
  expect(request.person.faceTo).not.toHaveBeenCalled()
  const unknown = { pos: [5, 7] satisfies V2, faceTo: vi.fn() }
  request.controls.reach(unknown)
  expect(request.marker.visible).toBe(false)
  expect(unknown.faceTo).not.toHaveBeenCalled()
  expect(request.notify).not.toHaveBeenCalled()
})
