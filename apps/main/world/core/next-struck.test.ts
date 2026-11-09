import { expect, it } from "vitest"
import { isAttackCoolingDown } from "#/world/core/is-attack-cooling-down"
import { nextStruck } from "#/world/core/next-struck"

const delay = 1000

/** Blows sent every `every` ms for ten seconds, counted the way both the room and the player's record count them. */
function landed(every: number): number {
  const beat: { struck?: number; count: number } = { count: 0 }
  for (let now = 0; now <= 10_000; now += every) {
    if (isAttackCoolingDown({ delay, struck: beat.struck, now })) continue
    beat.struck = nextStruck({ delay, struck: beat.struck, now })
    beat.count++
  }
  return beat.count
}

it("lets a jittered early blow in without letting the allowance add up into faster swinging", () => {
  expect(landed(delay * 0.85)).toBeLessThanOrEqual(11)
  expect(landed(delay)).toBe(11)
})

it("starts the beat from the first blow and afresh after a pause", () => {
  expect(nextStruck({ delay, now: 500 })).toBe(500)
  expect(nextStruck({ delay, struck: 0, now: 850 })).toBe(1000)
  expect(nextStruck({ delay, struck: 0, now: 5000 })).toBe(5000)
})
