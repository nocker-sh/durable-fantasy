import { describe, expect, it } from "vitest"
import { apply } from "./apply.ts"
import { countItem, emptyBag } from "./bag.ts"
import { checkTrade, takenOf } from "./trade.ts"
import { BAG_SIZE } from "./bag.ts"
import { bagWith, player } from "../test/helpers.ts"

describe("trading face to face", () => {
  it("each side's lots and gold go to the other, and nothing is made or lost", () => {
    const a = player({ gold: 100, bag: bagWith(["herb", 5], ["log", 3]) })
    const b = player({ gold: 50, bag: bagWith(["jelly", 4]) })
    const oa = { lots: [{ slot: 0, count: 5 }], gold: 10 },
      ob = { lots: [{ slot: 0, count: 2 }], gold: 0 }
    expect(checkTrade(a, oa, b, ob, 1)).toBeNull()
    const outA = apply(a, { type: "trade-out", offer: oa }, { now: 1 }),
      outB = apply(b, { type: "trade-out", offer: ob }, { now: 1 })
    if (!outA.ok || !outB.ok) throw new Error("out")
    const inA = apply(outA.state, { type: "trade-in", stacks: takenOf(outB.events), gold: ob.gold }, { now: 1 })
    const inB = apply(outB.state, { type: "trade-in", stacks: takenOf(outA.events), gold: oa.gold }, { now: 1 })
    if (!inA.ok || !inB.ok) throw new Error("in")
    expect(countItem(inA.state.bag, "jelly")).toBe(2)
    expect(countItem(inA.state.bag, "herb")).toBe(0)
    expect(countItem(inB.state.bag, "herb")).toBe(5)
    expect(inA.state.gold + inB.state.gold).toBe(150)
    expect(inB.state.gold).toBe(60)
  })

  it("a worn tool changes hands as worn as it was", () => {
    const bag = [...emptyBag()]
    bag[0] = { item: "wood-axe", count: 1, q: 2, by: "ペーター", dur: 5 }
    const a = player({ bag })
    const out = apply(a, { type: "trade-out", offer: { lots: [{ slot: 0, count: 1 }], gold: 0 } }, { now: 1 })
    const into = out.ok ? apply(player(), { type: "trade-in", stacks: takenOf(out.events), gold: 0 }, { now: 1 }) : out
    expect(into.ok && into.state.bag.find((s) => s?.item === "wood-axe")).toEqual({ item: "wood-axe", count: 1, q: 2, by: "ペーター", dur: 5 })
  })

  it("refused when one side cannot give, or the other has no room", () => {
    const a = player({ gold: 5, bag: bagWith(["herb", 2]) })
    const b = player({ bag: bagWith(["jelly", 1]) })
    expect(checkTrade(a, { lots: [{ slot: 0, count: 3 }], gold: 0 }, b, { lots: [], gold: 0 }, 1)).toBe("NOT_ENOUGH")
    expect(checkTrade(a, { lots: [], gold: 6 }, b, { lots: [], gold: 0 }, 1)).toBe("NO_GOLD")
    // b's bag full of different things: a's herbs have nowhere to go
    const full = player({ bag: Array.from({ length: BAG_SIZE }, () => ({ item: "log" as const, count: 99 })) })
    expect(checkTrade(a, { lots: [{ slot: 0, count: 2 }], gold: 0 }, full, { lots: [], gold: 0 }, 1)).toBe("BAG_FULL")
    // the same slot twice is not two lots
    expect(
      checkTrade(
        a,
        {
          lots: [
            { slot: 0, count: 1 },
            { slot: 0, count: 1 },
          ],
          gold: 0,
        },
        b,
        { lots: [], gold: 0 },
        1,
      ),
    ).toBe("NOT_ENOUGH")
  })
})
