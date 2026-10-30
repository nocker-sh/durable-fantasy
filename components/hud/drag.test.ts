import { expect, it } from "vitest"
import type { DragEvent } from "react"
import { ITEM_DRAG } from "#/components/hud/drag"
import { readDrag } from "#/components/hud/read-drag"
const event = (text: string) => ({ dataTransfer: { getData: (type: string) => (type === ITEM_DRAG ? text : "") } }) as DragEvent
it.each(["null", "1", "true", '"text"', "[]", "{}", "{", '{"slot":0,"item":"herb"}', '{"skill":"unknown"}'])("rejects malformed or incomplete drag payload %s", (payload) => {
  expect(readDrag(event(payload))).toBeNull()
})
it("retains the exact grabbed tool and rejects inconsistent identities", () => {
  const source = { item: "wood-axe", slot: 0, stack: { item: "wood-axe", count: 1, q: 2, by: "ギュンター", dur: 3 } }
  expect(readDrag(event(JSON.stringify(source)))).toEqual(source)
  expect(readDrag(event(JSON.stringify({ ...source, item: "herb" })))).toBeNull()
  expect(readDrag(event(JSON.stringify({ ...source, slot: -1 })))).toBeNull()
  expect(readDrag(event(JSON.stringify({ ...source, slot: 24 })))).toBeNull()
})
it("accepts one worn item and rejects an ambiguous source", () => {
  const source = { item: "wood-axe", worn: "weapon", stack: { item: "wood-axe", count: 1, dur: 3 } }
  expect(readDrag(event(JSON.stringify(source)))).toEqual(source)
  expect(readDrag(event(JSON.stringify({ ...source, slot: 0 })))).toBeNull()
  expect(readDrag(event(JSON.stringify({ ...source, stack: { ...source.stack, count: 2 } })))).toBeNull()
})
it("accepts a known skill for shortcut binding", () => {
  expect(readDrag(event('{"skill":"first-aid"}'))).toEqual({ skill: "first-aid" })
})
