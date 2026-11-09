import { expect, it } from "vitest"
import { dealtWith } from "#/world/core/commerce-friendship"
import { SHOPS } from "#/world/core/shops"
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { FRIEND, FRIEND_MAX } from "#/world/core/friendship-rules"
import { dayOf } from "#/world/core/day-of"

const rollover = Date.parse("2026-11-07T06:00:00+09:00")
const day = 24 * 60 * 60_000
for (const name of new Set([...Object.values(SHOPS).flatMap((shop) => shop.keepers), STORAGE_KEEPER]))
  for (const initial of [0, FRIEND_MAX - 1])
    it(`${name}, friendship=${initial}: daily credit never goes backwards across the shared rollover`, () => {
      let state = { friends: { [name]: initial }, boughtOn: {} as Record<string, string> }
      const times = [rollover - 1, rollover, rollover - 1, rollover, rollover + day]
      const credits = [1, 2, 2, 2, 3]
      const stamped = [rollover - 1, rollover, rollover, rollover, rollover + day]
      for (const entry1 of times.entries()) {
        const index = entry1[0],
          now = entry1[1]

        const before = structuredClone(state)
        const next = dealtWith(state, [name, name], now)
        expect(state).toEqual(before)
        expect(next.friends[name]).toBe(Math.min(FRIEND_MAX, initial + credits[index] * FRIEND.bought))
        expect(next.boughtOn[name]).toBe(dayOf(stamped[index]))
        if (index === 2 || index === 3) {
          expect(next.friends).toBe(state.friends)
          expect(next.boughtOn).toBe(state.boughtOn)
        }
        state = next
      }
    })

it("an unreadable old day marker is replaced by the next successful business day", () => {
  const state = { friends: { [STORAGE_KEEPER]: 10 }, boughtOn: { [STORAGE_KEEPER]: "not-a-date" } }
  expect(dealtWith(state, [STORAGE_KEEPER], rollover)).toEqual({ friends: { [STORAGE_KEEPER]: 10 + FRIEND.bought }, boughtOn: { [STORAGE_KEEPER]: dayOf(rollover) } })
})
