import { afterEach, expect, it, vi } from "vitest"
import { SceneSpeech } from "#/world/scene/runtime/scene-speech"

afterEach(() => vi.restoreAllMocks())

function fixture() {
  vi.spyOn(performance, "now").mockReturnValue(100)
  const me = { id: "self" }
  const other = { id: "other" }
  const remotes = new Map([[other.id, other]])
  const create = vi.fn((text: string) => ({ text, remove: vi.fn() }))
  const place = vi.fn()
  const speech = new SceneSpeech({ me, remotes, create, place })
  return { me, other, remotes, create, place, speech }
}

it("ignores an unknown speaker and binds self to the local walker", () => {
  const f = fixture()
  f.speech.bubble("missing", "unknown")
  expect(f.create).not.toHaveBeenCalled()
  f.speech.bubble("me", "hello")
  f.speech.update(100)
  expect(f.place).toHaveBeenCalledWith(f.me, f.speech.elements[0])
})

it("replaces only the same speaker's previous bubble", () => {
  const f = fixture()
  f.speech.bubble("me", "first")
  f.speech.bubble("other", "remote")
  const original = f.speech.elements[0]
  const remote = f.speech.elements[1]
  f.speech.bubble("me", "second")
  expect(original.remove).toHaveBeenCalledOnce()
  expect(remote.remove).not.toHaveBeenCalled()
  expect(f.speech.elements.map((e) => e.text)).toEqual(["second", "remote"])
})

it("keeps the bubble at the exact expiry and removes it afterward", () => {
  const f = fixture()
  f.speech.bubble("me", "a")
  const element = f.speech.elements[0]
  f.speech.update(4180)
  expect(f.place).toHaveBeenCalledOnce()
  expect(element.remove).not.toHaveBeenCalled()
  f.speech.update(4181)
  expect(element.remove).toHaveBeenCalledOnce()
  expect(f.speech.elements).toEqual([])
})

it("caps long messages and removes a departed speaker independently", () => {
  const f = fixture()
  f.speech.bubble("me", "a".repeat(100))
  f.speech.bubble("other", "hello")
  const local = f.speech.elements[0]
  const remote = f.speech.elements[1]
  f.remotes.clear()
  f.speech.update(200)
  expect(remote.remove).toHaveBeenCalledOnce()
  expect(local.remove).not.toHaveBeenCalled()
  f.speech.update(8100)
  expect(local.remove).not.toHaveBeenCalled()
  f.speech.update(8101)
  expect(local.remove).toHaveBeenCalledOnce()
})

it("does not expose the owned collection through the layer's element list", () => {
  const f = fixture()
  f.speech.bubble("me", "hello")
  f.speech.elements.pop()
  expect(f.speech.elements).toHaveLength(1)
})
