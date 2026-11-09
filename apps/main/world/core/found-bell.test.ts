import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { countItem } from "#/world/core/count-item"
import { dayOf } from "#/world/core/day-of"
import { NODES } from "#/world/core/gather"
import { player } from "#/world/test/player"

const now = Date.parse("2026-11-09T05:00:00Z")
const meadow = NODES.find((node) => node.map === "south-meadow" && !node.needsTool)!
const elsewhere = NODES.find((node) => node.map !== "south-meadow" && !node.needsTool)!
const seeking = player({ errands: [{ id: "matthias-bell", day: dayOf(now), done: false }] })

it("turns up the lost bell once while gathering in the meadow with the errand open", () => {
  const first = apply(seeking, { type: "gather", node: meadow.id, roll: 0.5 }, { now })
  expect(first.ok).toBe(true)
  if (!first.ok) return
  expect(countItem(first.state.bag, "lost-bell")).toBe(1)
  expect(first.events[0]).toMatchObject({ type: "gathered", found: "lost-bell" })
  const again = apply(first.state, { type: "gather", node: meadow.id, roll: 0.5 }, { now: now + 1000 })
  if (again.ok) expect(countItem(again.state.bag, "lost-bell")).toBe(1)
})

it("finds no bell without the errand, or on another map", () => {
  const plain = apply(player(), { type: "gather", node: meadow.id, roll: 0.5 }, { now })
  if (plain.ok) expect(countItem(plain.state.bag, "lost-bell")).toBe(0)
  const away = apply(seeking, { type: "gather", node: elsewhere.id, roll: 0.5 }, { now })
  if (away.ok) expect(countItem(away.state.bag, "lost-bell")).toBe(0)
})
