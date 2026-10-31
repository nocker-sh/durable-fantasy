import { expect, it } from "vitest"
import { getTradeAnswerRejection } from "#/world/server/map-room/get-trade-answer-rejection"
import type { Presence } from "#/world/server/map-room/presence"

function participant(): Presence {
  return { player: null, owner: "owner", route: [[10, 10]], since: Date.now(), said: [], engaged: null }
}

it("prioritizes declining over changed availability and distance", () => {
  const recipient = participant()
  recipient.owner = null
  const asker = participant()
  asker.route = []
  expect(getTradeAnswerRejection({ recipient, asker, accepted: false })).toBe("DECLINED")
  expect(getTradeAnswerRejection({ recipient, asker, accepted: true })).toBe("BUSY")
})

it.each(["recipient", "asker"])("rejects changed availability on the %s before distance", (side) => {
  for (const patch of [{ owner: null }, { closed: true }, { down: true }, { engaged: "speaker" }]) {
    const participants = { recipient: participant(), asker: participant() }
    participants.asker.route = []
    Object.assign(participants[side === "recipient" ? "recipient" : "asker"], patch)
    expect(getTradeAnswerRejection({ ...participants, accepted: true })).toBe("BUSY")
  }
})

it("accepts nearby players, but rejects missing or distant destinations", () => {
  const recipient = participant()
  const asker = participant()
  expect(getTradeAnswerRejection({ recipient, asker, accepted: true })).toBeNull()
  asker.route = []
  expect(getTradeAnswerRejection({ recipient, asker, accepted: true })).toBe("TOO_FAR")
  asker.route = [[40, 40]]
  expect(getTradeAnswerRejection({ recipient, asker, accepted: true })).toBe("TOO_FAR")
})
