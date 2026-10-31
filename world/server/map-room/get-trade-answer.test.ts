import { expect, it } from "vitest"
import { getTradeAnswer } from "#/world/server/map-room/get-trade-answer"
import type { Presence } from "#/world/server/map-room/presence"

function participant(): Presence {
  return { player: null, owner: "owner", route: [[10, 10]], since: 1000, said: [], engaged: null }
}

it("prioritizes declining over changed availability and distance", () => {
  const recipient = participant()
  recipient.owner = null
  const asker = participant()
  asker.route = []
  expect(getTradeAnswer({ recipient, asker, accepted: false, now: 1000 })).toEqual({ ok: false, reason: "DECLINED" })
  expect(getTradeAnswer({ recipient, asker, accepted: true, now: 1000 })).toEqual({ ok: false, reason: "BUSY" })
})

it.each(["recipient", "asker"])("rejects changed availability on the %s before distance", (side) => {
  for (const patch of [{ owner: null }, { closed: true }, { down: true }, { engaged: "speaker" }]) {
    const participants = { recipient: participant(), asker: participant() }
    participants.asker.route = []
    Object.assign(participants[side === "recipient" ? "recipient" : "asker"], patch)
    expect(getTradeAnswer({ ...participants, accepted: true, now: 1000 })).toEqual({ ok: false, reason: "BUSY" })
  }
})

it("accepts nearby players, but rejects missing or distant destinations", () => {
  const recipient = participant()
  const asker = participant()
  expect(getTradeAnswer({ recipient, asker, accepted: true, now: 1000 })).toEqual({ ok: true, recipientAt: [10, 10], askerAt: [10, 10] })
  asker.route = []
  expect(getTradeAnswer({ recipient, asker, accepted: true, now: 1000 })).toEqual({ ok: false, reason: "TOO_FAR" })
  asker.route = [[40, 40]]
  expect(getTradeAnswer({ recipient, asker, accepted: true, now: 1000 })).toEqual({ ok: false, reason: "TOO_FAR" })
})

it("returns independent stopping cells at the supplied time without changing either route", () => {
  const recipient = participant()
  recipient.route = Array.from({ length: 11 }, (_, index) => [10 + index, 10])
  const asker = participant()
  asker.route = [[12, 10]]
  const before = structuredClone({ recipient, asker })
  const decision = getTradeAnswer({ recipient, asker, accepted: true, now: 1000 })
  expect(decision).toEqual({ ok: true, recipientAt: [11, 10], askerAt: [12, 10] })
  if (!decision.ok) throw Error("Expected a valid nearby trade")
  expect(decision.recipientAt).not.toBe(recipient.route[1])
  expect(decision.askerAt).not.toBe(asker.route[0])
  expect({ recipient, asker }).toEqual(before)
})

it("rejects a recipient without a stopping position", () => {
  const recipient = participant()
  recipient.route = []
  expect(getTradeAnswer({ recipient, asker: participant(), accepted: true, now: 1000 })).toEqual({ ok: false, reason: "TOO_FAR" })
})
