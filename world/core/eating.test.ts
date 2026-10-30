import { describe, expect, it } from "vitest"
import { apply } from "./apply"
import { addItem } from "#/world/core/add-item"
import { emptyBag } from "#/world/core/empty-bag"
import { effectOf } from "#/world/core/effect-of"
import { priceOf } from "#/world/core/price-of"
import { DIGEST_MS } from "#/world/core/player-rules"
import { fullNow } from "#/world/core/full-now"
import { player } from "#/world/test/player"

const MIN = 60_000

describe("eating: stamina, fullness and warmth", () => {
  it("food gives stamina back, fills you up and warms you for a while", () => {
    const p = player({ stamina: 20, bag: addItem({ bag: emptyBag(), item: "stew", count: 1, mark: { q: 1, by: "ゲルダ" } })! })
    const r = apply(p, { type: "use", slot: 0 }, { now: 1000 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.stamina).toBe(20 + effectOf("stew", 1, "ゲルダ").stamina)
    expect(fullNow(r.state, 1000)).toBe(35)
    expect(r.state.warmUntil).toBe(1000 + effectOf("stew", 1, "ゲルダ").warm * MIN)
  })

  it("you cannot eat past full, and fullness wears off with time", () => {
    const p = player({ stamina: 0, full: 90, fullAt: 0, bag: addItem({ bag: emptyBag(), item: "stew", count: 2 })! })
    expect(apply(p, { type: "use", slot: 0 }, { now: 0 })).toEqual({ ok: false, reason: "TOO_FULL" })
    expect(fullNow(p, 30 * DIGEST_MS)).toBe(60)
    expect(apply(p, { type: "use", slot: 0 }, { now: 30 * DIGEST_MS }).ok).toBe(true)
  })

  it("the road out of town tires you, more in the cold unless you are warm, and stops you at nothing", () => {
    const cold = apply(player({ stamina: 50 }), { type: "tire", amount: 4 }, { now: 0 })
    expect(cold.ok && cold.state.stamina).toBe(44)
    const warm = apply(player({ stamina: 50, warmUntil: 10 * MIN }), { type: "tire", amount: 4 }, { now: MIN })
    expect(warm.ok && warm.state.stamina).toBe(46)
    expect(apply(player({ stamina: 0 }), { type: "tire", amount: 4 })).toEqual({ ok: false, reason: "EXHAUSTED" })
  })

  it("the porridge at the chapel is always cheap enough to keep going", () => {
    expect(priceOf("porridge", 0, "ベネディクト")).toBeLessThanOrEqual(2)
    expect(effectOf("porridge", 0, "ベネディクト").stamina).toBeGreaterThan(0)
  })
})
