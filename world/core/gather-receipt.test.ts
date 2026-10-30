import { expect, it } from "vitest"
import { receiveGather } from "#/world/core/receive-gather"
import { player } from "#/world/test/player"
const request = { id: 1, node: "south-meadow-herbs-1", roll: 0.3 }
it("applies gathering once and replays the recorded success without consuming another tool or stamina", () => {
  const first = receiveGather({ player: player(), previous: undefined, request: request, now: 1000, reserved: false })
  if (!first.result.ok) throw Error(first.result.reason)
  const later = { ...first.result.state, gold: 123 }
  expect(receiveGather({ player: later, previous: first.receipt, request: request, now: 2000, reserved: true })).toEqual({ result: { ok: true, state: later, events: [] } })
  expect(receiveGather({ player: later, previous: first.receipt, request: { ...request, roll: 0.9 }, now: 2000, reserved: false }).result).toEqual({ ok: false, reason: "NOT_READY" })
  expect(receiveGather({ player: later, previous: first.receipt, request: { ...request, id: 0 }, now: 2000, reserved: false }).result.ok).toBe(false)
})
it("keeps a refusal after circumstances change and rejects malformed new draws", () => {
  const first = receiveGather({ player: player(), previous: undefined, request: request, now: 1000, reserved: true })
  expect(first.result).toEqual({ ok: false, reason: "NOT_READY" })
  expect(receiveGather({ player: player(), previous: first.receipt, request: request, now: 2000, reserved: false }).result).toEqual(first.result)
  for (const roll of [-1, 1, NaN, Infinity]) expect(receiveGather({ player: player(), previous: undefined, request: { ...request, roll }, now: 1000, reserved: false }).receipt).toBeUndefined()
})
