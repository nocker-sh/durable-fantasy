import { expect, it } from "vitest"
import { getStockLockCycle } from "#/world/town/get-stock-lock-cycle"
import { withStockLockEvent } from "#/world/town/with-stock-lock-event"
import { stockLockStateSchema } from "#/world/town/stock-lock-schemas"
import type { StockLockEvent } from "#/world/town/stock-lock-schemas"

function visit(): StockLockEvent[] {
  return [
    { kind: "inspect_empty" },
    { kind: "gate", gate: "outer", action: "unlatch" },
    { kind: "gate", gate: "outer", action: "open" },
    { kind: "operator_move", to: "vestibule" },
    { kind: "gate", gate: "outer", action: "close" },
    { kind: "gate", gate: "outer", action: "latch" },
    { kind: "gate", gate: "inner", action: "unlatch" },
    { kind: "gate", gate: "inner", action: "open" },
    { kind: "operator_move", to: "pasture" },
    { kind: "gate", gate: "inner", action: "close" },
    { kind: "gate", gate: "inner", action: "latch" },
    { kind: "gate", gate: "inner", action: "unlatch" },
    { kind: "gate", gate: "inner", action: "open" },
    { kind: "operator_move", to: "vestibule" },
    { kind: "gate", gate: "inner", action: "close" },
    { kind: "gate", gate: "inner", action: "latch" },
    { kind: "inspect_empty" },
    { kind: "gate", gate: "outer", action: "unlatch" },
    { kind: "gate", gate: "outer", action: "open" },
    { kind: "operator_move", to: "outside" },
    { kind: "gate", gate: "outer", action: "close" },
    { kind: "gate", gate: "outer", action: "latch" },
  ]
}

function movingVisit(): StockLockEvent[] {
  return [
    { kind: "inspect_empty" },
    { kind: "gate", gate: "outer", action: "unlatch" },
    { kind: "gate", gate: "outer", action: "open", motion: "push_open" },
    { kind: "gate", gate: "outer", action: "close", motion: "pull_close" },
    { kind: "gate", gate: "outer", action: "latch" },
    { kind: "gate", gate: "inner", action: "unlatch" },
    { kind: "gate", gate: "inner", action: "open", motion: "push_open" },
    { kind: "gate", gate: "inner", action: "close", motion: "pull_close" },
    { kind: "gate", gate: "inner", action: "latch" },
    { kind: "gate", gate: "inner", action: "unlatch" },
    { kind: "gate", gate: "inner", action: "open", motion: "pull_open" },
    { kind: "gate", gate: "inner", action: "close", motion: "back_out_close" },
    { kind: "gate", gate: "inner", action: "latch" },
    { kind: "inspect_empty" },
    { kind: "gate", gate: "outer", action: "unlatch" },
    { kind: "gate", gate: "outer", action: "open", motion: "pull_open" },
    { kind: "gate", gate: "outer", action: "close", motion: "back_out_close" },
    { kind: "gate", gate: "outer", action: "latch" },
  ]
}

it("updates the caretaker's region while pushing open or backing out with the closing gate", () => {
  const events = movingVisit(),
    before = JSON.stringify(events),
    cycle = getStockLockCycle(["sheep-1", "sheep-2"], events)
  if (cycle instanceof Error) throw cycle
  expect(cycle.final.operator).toBe("outside")
  expect(cycle.final.gates).toEqual({ outer: "latched", inner: "latched" })
  expect(cycle.steps).toBe(18)
  expect(JSON.stringify(events)).toBe(before)
})

it("keeps an individual seen crossing during closure and requires its recorded return before reinspection", () => {
  const events = movingVisit(),
    closing = events.find((event) => event.kind === "gate" && event.gate === "inner" && event.motion === "pull_close")
  if (!closing || closing.kind !== "gate") throw new Error("Missing inward closure")
  closing.stock_crossings = [{ id: "sheep-1", to: "vestibule" }]
  expect(getStockLockCycle(["sheep-1", "sheep-2"], events)).toEqual(new Error("Cannot confirm an empty stock lock"))
  const reopening = events.find((event) => event.kind === "gate" && event.gate === "inner" && event.motion === "pull_open")
  if (!reopening || reopening.kind !== "gate") throw new Error("Missing reopening")
  reopening.stock_crossings = [{ id: "sheep-1", to: "pasture" }]
  expect(getStockLockCycle(["sheep-1", "sheep-2"], events)).not.toBeInstanceOf(Error)
})

it("rejects pulling from the wrong side or attaching crossings to latch actions", () => {
  const state = stockLockStateSchema.parse({ operator: "outside", stock: { sheep: "pasture" }, gates: { outer: "closed", inner: "latched" }, empty_checked: true })
  expect(withStockLockEvent(state, { kind: "gate", gate: "outer", action: "open", motion: "pull_open" })).toEqual(new Error("Pulling or backing out must start on the inward gate side"))
  expect(withStockLockEvent(state, { kind: "gate", gate: "outer", action: "latch", motion: "push_open" })).toEqual(new Error("A stationary latch action cannot cross the stock gate"))
  expect(
    withStockLockEvent(state, {
      kind: "gate",
      gate: "outer",
      action: "open",
      motion: "push_open",
      stock_crossings: [
        { id: "sheep", to: "vestibule" },
        { id: "sheep", to: "pasture" },
      ],
    }),
  ).toEqual(new Error("Duplicate animal crossing in stock gate motion"))
})

it("finishes a complete visit with both gates latched and every individual retained, without mutating the plan", () => {
  const events = visit(),
    before = JSON.stringify(events),
    cycle = getStockLockCycle(["sheep-1", "sheep-2"], events)
  if (cycle instanceof Error) throw cycle
  expect(cycle.final.operator).toBe("outside")
  expect(cycle.final.gates).toEqual({ outer: "latched", inner: "latched" })
  expect(cycle.final.stock).toEqual({ "sheep-1": "pasture", "sheep-2": "pasture" })
  expect(cycle.steps).toBe(22)
  expect(JSON.stringify(events)).toBe(before)
})

it("does not treat a closed but unlatched peer as a secure barrier", () => {
  const events = visit(),
    latch = events.findIndex((event) => event.kind === "gate" && event.gate === "outer" && event.action === "latch")
  events.splice(latch, 1)
  expect(getStockLockCycle(["sheep-1"], events)).toEqual(new Error("Other stock gate must be latched"))
})

it("requires a fresh empty-lock inspection after the inner gate has been unlatched", () => {
  const events = visit()
  events.splice(events.length - 1 - [...events].reverse().findIndex((event) => event.kind === "inspect_empty"), 1)
  expect(getStockLockCycle(["sheep-1"], events)).toEqual(new Error("Outer gate requires an inspected empty lock and retained stock"))
  expect(
    getStockLockCycle(
      ["sheep-1"],
      visit().filter((event) => event.kind !== "inspect_empty"),
    ),
  ).toBeInstanceOf(Error)
})

it("does not clear a stray sheep by inspecting, but permits a recorded return before rechecking", () => {
  const events = visit(),
    entering = events.findIndex((event) => event.kind === "operator_move" && event.to === "pasture")
  events.splice(entering, 0, { kind: "stock_move", id: "sheep-1", to: "vestibule" })
  expect(getStockLockCycle(["sheep-1", "sheep-2"], events)).toEqual(new Error("Cannot confirm an empty stock lock"))
  const returning = events.length - 1 - [...events].reverse().findIndex((event) => event.kind === "operator_move" && event.to === "vestibule")
  events.splice(returning + 1, 0, { kind: "stock_move", id: "sheep-1", to: "pasture" })
  expect(getStockLockCycle(["sheep-1", "sheep-2"], events)).not.toBeInstanceOf(Error)
})

it("rejects teleportation, closed-gate animal movement and remote gate operation", () => {
  const state = stockLockStateSchema.parse({ operator: "outside", stock: { "sheep-1": "pasture" }, gates: { outer: "latched", inner: "latched" }, empty_checked: false }),
    before = JSON.stringify(state)
  expect(withStockLockEvent(state, { kind: "operator_move", to: "pasture" })).toEqual(new Error("Stock lock move has no open adjacent gate"))
  expect(withStockLockEvent(state, { kind: "stock_move", id: "sheep-1", to: "vestibule" })).toEqual(new Error("Stock lock move has no open adjacent gate"))
  expect(withStockLockEvent(state, { kind: "gate", gate: "inner", action: "unlatch" })).toEqual(new Error("Operator is not adjacent to the stock gate"))
  expect(withStockLockEvent(state, { kind: "stock_move", id: "unknown", to: "vestibule" })).toEqual(new Error("Unknown stock lock animal"))
  expect(JSON.stringify(state)).toBe(before)
})

it("rejects incomplete visits and invalid or missing stock inventories", () => {
  expect(getStockLockCycle(["sheep-1"], visit().slice(0, -1))).toEqual(new Error("Stock lock visit does not finish secured"))
  for (const ids of [[], [""], ["sheep-1", "sheep-1"]]) expect(getStockLockCycle(ids, visit())).toEqual(new Error("Invalid stock lock cycle"))
  expect(getStockLockCycle(["sheep-1"], [{ kind: "gate", gate: "outer", action: "teleport" }])).toEqual(new Error("Invalid stock lock cycle"))
})

it("keeps a latched barrier and retains the animal in every reachable symbolic state", () => {
  const initial = stockLockStateSchema.parse({ operator: "outside", stock: { sheep: "pasture" }, gates: { outer: "latched", inner: "latched" }, empty_checked: false })
  const gates: ReadonlyArray<"outer" | "inner"> = ["outer", "inner"],
    actions: ReadonlyArray<"unlatch" | "open" | "close" | "latch"> = ["unlatch", "open", "close", "latch"],
    places: ReadonlyArray<"outside" | "vestibule" | "pasture"> = ["outside", "vestibule", "pasture"]
  const motions: ReadonlyArray<NonNullable<Extract<StockLockEvent, { kind: "gate" }>["motion"]>> = ["push_open", "pull_open", "pull_close", "back_out_close"]
  const movingEvents = gates.flatMap((gate) => actions.flatMap((action) => motions.map((motion) => ({ kind: "gate", gate, action, motion }) satisfies StockLockEvent)))
  const observedEvents = movingEvents.flatMap((event) => places.map((to) => ({ ...event, stock_crossings: [{ id: "sheep", to }] })))
  const events: StockLockEvent[] = [
    { kind: "inspect_empty" },
    ...gates.flatMap((gate) => actions.map((action) => ({ kind: "gate", gate, action }) satisfies StockLockEvent)),
    ...places.flatMap((to) => [{ kind: "operator_move", to } satisfies StockLockEvent, { kind: "stock_move", id: "sheep", to } satisfies StockLockEvent]),
    ...movingEvents,
    ...observedEvents,
  ]
  const pending = [initial],
    visited = new Set([JSON.stringify(initial)]),
    cursor = { at: 0 }
  while (cursor.at < pending.length) {
    const state = pending[cursor.at++]
    expect(state.gates.outer === "latched" || state.gates.inner === "latched").toBe(true)
    expect(state.stock.sheep).not.toBe("outside")
    for (const event of events) {
      const next = withStockLockEvent(state, event)
      if (next instanceof Error) continue
      const key = JSON.stringify(next)
      if (!visited.has(key)) {
        visited.add(key)
        pending.push(next)
      }
    }
    expect(visited.size).toBeLessThanOrEqual(162)
  }
  expect(visited.size).toBeGreaterThan(1)
})
