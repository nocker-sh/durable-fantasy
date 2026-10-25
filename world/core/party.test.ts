import { describe, expect, it } from "vitest"
import { PARTY_MAX, emptyParty, join, leave, shareOut, type Member } from "./party.ts"

const m = (owner: string, level = 1): Member => ({ owner, name: owner, level, hp: 10, maxHp: 10, map: "南の草原", at: 0 })

describe("parties", () => {
  it("the first in leads; at most twelve; the next one leads when the leader goes; one left is no party", () => {
    let p = join(emptyParty(), m("a"))!
    p = join(p, m("b"))!
    expect(p.leader).toBe("a")
    for (let i = 2; i < PARTY_MAX; i++) p = join(p, m(`x${i}`))!
    expect(join(p, m("late"))).toBeNull()
    p = leave(p, "a")
    expect(p.leader).toBe("b")
    let two = join(join(emptyParty(), m("a"))!, m("b"))!
    two = leave(two, "b")
    expect(two.members).toHaveLength(0)
  })

  it("experience: each one's own, or shared evenly among those within fifteen levels", () => {
    expect(shareOut(9, "own", { owner: "a", level: 1 }, [{ owner: "b", level: 1 }])).toEqual([{ owner: "a", exp: 9 }])
    expect(
      shareOut(9, "even", { owner: "a", level: 1 }, [
        { owner: "b", level: 3 },
        { owner: "c", level: 30 },
      ]),
    ).toEqual([
      { owner: "a", exp: 5 },
      { owner: "b", exp: 4 },
    ])
  })

  it("an even share rounds down, the one who beat it gets what is left over, and the shares never pass the whole", () => {
    const three = shareOut(10, "even", { owner: "a", level: 4 }, [
      { owner: "b", level: 4 },
      { owner: "c", level: 4 },
    ])
    expect(three).toEqual([
      { owner: "a", exp: 4 },
      { owner: "b", exp: 3 },
      { owner: "c", exp: 3 },
    ])
    for (let exp = 0; exp <= 40; exp++)
      for (let n = 0; n < PARTY_MAX; n++) {
        const near = Array.from({ length: n }, (_, i) => ({ owner: `m${i}`, level: 1 }))
        const shares = shareOut(exp, "even", { owner: "k", level: 1 }, near)
        expect(
          shares.reduce((a, x) => a + x.exp, 0),
          `${exp} among ${n + 1}`,
        ).toBe(exp)
        expect(Math.max(...shares.map((x) => x.exp)) - Math.min(...shares.map((x) => x.exp))).toBeLessThan(n + 1)
      }
  })
})
