import { describe, expect, it } from "vitest"
import { PARTY_BONUS, PARTY_MAX, SHARE_LEVELS } from "#/world/core/party/rules"
import { emptyParty } from "#/world/core/party/empty-party"
import { join } from "#/world/core/party/join"
import { leave } from "#/world/core/party/leave"
import { shareOut } from "#/world/core/party/share-out"
import { type Member } from "#/world/core/party/types"

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

  it("experience: each one's own, or shared evenly among those within a few levels of the highest", () => {
    expect(shareOut({ exp: 9, mode: "own", killer: { owner: "a", level: 1 }, near: [{ owner: "b", level: 1 }] })).toEqual([{ owner: "a", exp: 9 }])
    expect(
      shareOut({
        exp: 9,
        mode: "even",
        killer: { owner: "a", level: 1 },
        near: [
          { owner: "b", level: 3 },
          { owner: "c", level: 30 },
        ],
      }),
    ).toEqual([
      { owner: "a", exp: 0 },
      { owner: "c", exp: 9 },
    ])
    expect(shareOut({ exp: 9, mode: "even", killer: { owner: "a", level: 1 }, near: [{ owner: "b", level: 3 }] })).toEqual([
      { owner: "a", exp: 5 },
      { owner: "b", exp: 4 },
    ])
  })

  it("does not let a low member's last blow take a strong creature's reward past the higher member", () => {
    const shares = shareOut({ exp: 400, mode: "even", killer: { owner: "low", level: 1 }, near: [{ owner: "high", level: 20 }] })
    expect(shares).toEqual([
      { owner: "low", exp: 0 },
      { owner: "high", exp: 400 },
    ])
  })

  it("an even share adds a little per member, rounds down, gives the one who beat it what is left over and never passes the bonus", () => {
    const three = shareOut({
      exp: 10,
      mode: "even",
      killer: { owner: "a", level: 4 },
      near: [
        { owner: "b", level: 4 },
        { owner: "c", level: 4 },
      ],
    })
    expect(three).toEqual([
      { owner: "a", exp: 4 },
      { owner: "b", exp: 4 },
      { owner: "c", exp: 4 },
    ])
    for (let exp = 0; exp <= 40; exp++)
      for (let n = 0; n < PARTY_MAX; n++) {
        const near = Array.from({ length: n }, (_, i) => ({ owner: `m${i}`, level: 1 }))
        const shares = shareOut({ exp: exp, mode: "even", killer: { owner: "k", level: 1 }, near: near })
        const total = Math.floor(exp * (1 + PARTY_BONUS * n))
        expect(
          shares.reduce((a, x) => a + x.exp, 0),
          `${exp} among ${n + 1}`,
        ).toBe(total)
        expect(shares.filter((x) => x.owner !== "k").every((x) => x.exp > 0)).toBe(true)
        if (shares.length > 1) expect(Math.max(...shares.map((x) => x.exp)) - Math.min(...shares.map((x) => x.exp))).toBeLessThan(n + 1)
      }
  })

  it("keeps members more than a few levels apart out of the share", () => {
    const shares = shareOut({
      exp: 20,
      mode: "even",
      killer: { owner: "a", level: 10 },
      near: [
        { owner: "near", level: 10 + SHARE_LEVELS },
        { owner: "far", level: 10 + SHARE_LEVELS + 1 },
      ],
    })
    // measured from the highest member, the killer is too far below to share
    expect(shares.map((x) => x.owner)).toEqual(["a", "near", "far"])
    expect(shares[0].exp).toBe(0)
  })

  it("sends nothing to members whose share rounds down to nothing", () => {
    expect(shareOut({ exp: 1, mode: "even", killer: { owner: "a", level: 1 }, near: [{ owner: "b", level: 1 }] })).toEqual([{ owner: "a", exp: 1 }])
  })
})
