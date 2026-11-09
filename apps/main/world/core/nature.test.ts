import { expect, it } from "vitest"
import { NODES } from "#/world/core/gather"
import { emptyNature } from "#/world/core/nature/empty-nature"
import { takeOne } from "#/world/core/nature/take-one"
import { giveOne } from "#/world/core/nature/give-one"
import { leftAt } from "#/world/core/nature/left-at"

it.each(NODES)("returns a rejected attempt at $id without counting regeneration twice", (node) => {
  const step = node.regen * 60_000
  let state = emptyNature()
  for (let i = 0; i < node.max; i++) state = takeOne(state, node.id, 0)!
  const returned = giveOne(state, node.id, step + step / 2)
  expect(leftAt(returned, node.id, step + step / 2)).toBe(2)
  expect(leftAt(returned, node.id, 2 * step - 1)).toBe(2)
  expect(leftAt(returned, node.id, 2 * step)).toBe(3)
})
it("caps a delayed return at the node's capacity and starts the next consumption clock anew", () => {
  const node = NODES[0],
    step = node.regen * 60_000
  const depleted = takeOne(emptyNature(), node.id, 0)!
  const returned = giveOne(depleted, node.id, 10 * step)
  expect(leftAt(returned, node.id, 10 * step)).toBe(node.max)
  const next = takeOne(returned, node.id, 10 * step + 1)!
  expect(leftAt(next, node.id, 11 * step)).toBe(node.max - 1)
  expect(leftAt(next, node.id, 11 * step + 1)).toBe(node.max)
})

it("does not spend stored resources when the clock moves backwards", () => {
  for (const node of NODES) {
    const step = node.regen * 60_000
    const savedAt = 10 * step
    const state = { nodes: { [node.id]: { left: 1, at: savedAt } } }
    const before = structuredClone(state)
    expect(leftAt(state, node.id, savedAt - 3 * step)).toBe(1)
    expect(state).toEqual(before)
  }
})

it("can consume a stored resource before its recovery clock without moving that clock backwards", () => {
  const node = NODES[0]
  const step = node.regen * 60_000
  const savedAt = 10 * step
  const state = { nodes: { [node.id]: { left: 2, at: savedAt } } }
  const consumed = takeOne(state, node.id, savedAt - 3 * step)
  expect(consumed?.nodes[node.id]).toEqual({ left: 1, at: savedAt })
  expect(state.nodes[node.id]).toEqual({ left: 2, at: savedAt })
  if (!consumed) throw new Error("Stored resource was refused")
  expect(leftAt(consumed, node.id, savedAt + step - 1)).toBe(1)
  expect(leftAt(consumed, node.id, savedAt + step)).toBe(2)
})

it("returns exactly one resource before its recovery clock and resumes regeneration from the stored time", () => {
  const node = NODES[0]
  const step = node.regen * 60_000
  const savedAt = 10 * step
  const state = { nodes: { [node.id]: { left: 0, at: savedAt } } }
  const returned = giveOne(state, node.id, savedAt - 3 * step)
  expect(returned.nodes[node.id]).toEqual({ left: 1, at: savedAt })
  expect(state.nodes[node.id]).toEqual({ left: 0, at: savedAt })
  expect(leftAt(returned, node.id, savedAt + step - 1)).toBe(1)
  expect(leftAt(returned, node.id, savedAt + step)).toBe(2)
})
