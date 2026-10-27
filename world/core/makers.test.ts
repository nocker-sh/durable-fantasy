import { describe, expect, it } from "vitest"
import { apply, makerAt } from "./apply.ts"
import { addItem, countItem, emptyBag, moveSlot } from "./bag.ts"
import { displayName, effectOf, priceOf, qualitiesOf, MAKERS } from "./makers.ts"
import { ITEMS, type ItemId } from "./items.ts"
import { SHOPS } from "./shops.ts"
import { player } from "../test/helpers.ts"

describe("quality and makers", () => {
  it("a made thing carries its maker's name, and better quality works better and costs more", () => {
    expect(displayName("potion", "イルムガルト")).toBe("イルムガルトの回復薬")
    expect(displayName("apple")).toBe("リンゴ")
    expect(effectOf("potion", 3, "イルムガルト").hp).toBeGreaterThan(effectOf("potion", 0, "イルムガルト").hp)
    expect(priceOf("potion", 3, "イルムガルト")).toBeGreaterThan(priceOf("potion", 0, "イルムガルト"))
  })

  it("each maker's hand shows: Gerda's warms you, the monk's leans to SP, Irmgard's is steady", () => {
    expect(effectOf("potion", 1, "ゲルダ").warm).toBeGreaterThan(0)
    expect(effectOf("potion", 1, "ベネディクト").sp).toBeGreaterThan(effectOf("potion", 1, "イルムガルト").sp)
    const [lo, , , hi] = MAKERS["イルムガルト"].potion!.tiers
    const [glo, , , ghi] = MAKERS["ゲルダ"].potion!.tiers
    expect(lo + hi).toBeLessThan(glo + ghi) // less spread
  })

  it("only the same thing of the same quality by the same maker stacks", () => {
    let bag = addItem(emptyBag(), "potion", 2, { q: 1, by: "イルムガルト" })!
    bag = addItem(bag, "potion", 1, { q: 2, by: "イルムガルト" })!
    bag = addItem(bag, "potion", 1, { q: 1, by: "ゲルダ" })!
    expect(bag.filter(Boolean)).toHaveLength(3)
    expect(countItem(bag, "potion")).toBe(4)
    expect(countItem(bag, "potion", { by: "ゲルダ" })).toBe(1)
    // dragging one kind onto another swaps them rather than merging
    const moved = moveSlot(bag, 2, 0)!
    expect(moved[0]?.by).toBe("ゲルダ")
    expect(moved[2]?.by).toBe("イルムガルト")
  })

  it("a shop sells its maker's things, in the qualities they come in, at their price", () => {
    const p = player({ gold: 1000 })
    const r = apply(p, { type: "buy", shop: "apothecary", item: "potion", count: 1, q: 2 })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.state.bag.find((s) => s?.item === "potion")).toMatchObject({ q: 2, by: "イルムガルト" })
    expect(r.state.gold).toBe(1000 - priceOf("potion", 2, "イルムガルト"))
    const shut = qualitiesOf("porridge", "ベネディクト")
    expect(shut).not.toContain(3)
  })

  it("every food and drink does something, and every made thing on sale has a maker who makes it", () => {
    for (const [id, item] of Object.entries(ITEMS)) {
      if (item.kind !== "consumable") continue
      const e = effectOf(id as ItemId)
      expect(e.hp + e.sp + e.stamina + e.warm, id).toBeGreaterThan(0)
    }
    for (const [shopId, shop] of Object.entries(SHOPS))
      for (const id of shop.stock) {
        if (!ITEMS[id].made) continue
        const by = makerAt(shopId as keyof typeof SHOPS, id)
        expect(MAKERS[by]?.[id], `${shopId}: ${by} makes ${id}`).toBeDefined()
      }
  })
})

it.each([
  ["crystal", "prayer-necklace", "ベネディクト"],
  ["smithy", "iron-sword", "ギュンター"],
  ["tailor", "wool-muffler", "マグダレーナ"],
  ["woodworker", "short-bow", "ゴットフリート"],
  ["armorer", "wooden-shield", "ゴットフリート"],
  ["leather", "fang-charm", "ルドルフ"],
] as const)("keeps the maker when equipment from %s is bought and worn", (shop, item, by) => {
  const bought = apply(player({ gold: 1000, stats: { ...player().stats, str: 20, dex: 20 } }), { type: "buy", shop, item, count: 1 })
  if (!bought.ok) throw Error(bought.reason)
  expect(bought.state.gold).toBe(1000 - ITEMS[item].price)
  expect(qualitiesOf(item, by)).toEqual([1])
  const slot = bought.state.bag.findIndex((s) => s?.item === item)
  expect(bought.state.bag[slot]).toMatchObject({ by, q: 1 })
  const equipped = apply(bought.state, { type: "equip", slot })
  if (!equipped.ok) throw Error(equipped.reason)
  expect(Object.values(equipped.state.worn)).toContainEqual({ by, q: 1 })
})
