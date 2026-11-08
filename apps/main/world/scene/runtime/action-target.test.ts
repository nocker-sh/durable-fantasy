import { expect, it } from "vitest"
import { PendingAction } from "#/world/scene/runtime/action-target"

it("replaces earlier gathering, conversation and combat with the newest purpose", () => {
  const action = new PendingAction<string>()
  action.select({ kind: "spot", id: "herbs" })
  action.select({ kind: "talk", resident: "keeper" })
  expect(action.arrive()).toEqual({ kind: "talk", resident: "keeper" })
  expect(action.arrive()).toBeNull()
  action.select({ kind: "fight", id: "slime" })
  action.select({ kind: "spot", id: "tree" })
  expect(action.fighting).toBeNull()
  expect(action.arrive()).toEqual({ kind: "spot", id: "tree" })
})

it("consumes arrival before a callback selects another destination", () => {
  const action = new PendingAction<string>()
  action.select({ kind: "talk", resident: "keeper" })
  const arrived = action.arrive()
  if (arrived?.kind === "talk") action.select({ kind: "spot", id: "station:forge" })
  expect(arrived).toEqual({ kind: "talk", resident: "keeper" })
  expect(action.current).toEqual({ kind: "spot", id: "station:forge" })
  expect(action.arrive()).toEqual({ kind: "spot", id: "station:forge" })
  expect(action.arrive()).toBeNull()
})

it("retains a chase across path arrivals and ignores a different creature's defeat", () => {
  const action = new PendingAction<string>()
  action.select({ kind: "fight", id: "slime" })
  expect(action.arrive()).toBeNull()
  action.endFight("other")
  expect(action.fighting).toBe("slime")
  action.endFight("slime")
  expect(action.current).toBeNull()
  action.select({ kind: "talk", resident: "keeper" })
  action.endFight()
  expect(action.current?.kind).toBe("talk")
})

it("cancels pending arrivals and attacks on stop", () => {
  const action = new PendingAction<string>()
  for (const target of [
    { kind: "spot", id: "herbs" },
    { kind: "fight", id: "slime" },
    { kind: "talk", resident: "keeper" },
  ] as const) {
    action.select(target)
    action.clear()
    expect(action.arrive()).toBeNull()
    expect(action.fighting).toBeNull()
  }
})
