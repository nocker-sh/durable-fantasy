import { describe, expect, it } from "vitest";
import { apply } from "./apply.ts";
import { addItem, countItem, emptyBag, type Bag } from "./bag.ts";
import { COMMISSIONS, MAX_ORDERS } from "./commissions.ts";
import { ITEMS, type ItemId } from "./items.ts";
import { RESIDENTS } from "../town/residents.ts";
import { player } from "../test/helpers.ts";

const bag = (...items: [ItemId, number][]): Bag => items.reduce<Bag>((b, [id, n]) => addItem(b, id, n)!, emptyBag());
const H = 3_600_000;

describe("commissions", () => {
  it("takes the iron and the fee now, and the sword is ready in two hours", () => {
    const p = player({ gold: 200, bag: bag(["iron-ingot", 3]) });
    const r = apply(p, { type: "order", commission: "gunter-sword", roll: 0.5 }, { now: 0 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(countItem(r.state.bag, "iron-ingot")).toBe(0);
    expect(r.state.gold).toBe(80);
    expect(apply(r.state, { type: "collect", index: 0 }, { now: H })).toEqual({ ok: false, reason: "NOT_READY" });
    const got = apply(r.state, { type: "collect", index: 0 }, { now: 2 * H });
    expect(got.ok && countItem(got.state.bag, "iron-sword")).toBe(1);
    expect(got.ok && got.state.orders).toHaveLength(0);
  });

  it("a made thing comes with the craftsman's name and their quality", () => {
    const p = player({ gold: 200, bag: bag(["herb", 10], ["jelly", 2]) });
    const r = apply(p, { type: "order", commission: "irmgard-potions", roll: 0.5 }, { now: 0 });
    const got = r.ok ? apply(r.state, { type: "collect", index: 0 }, { now: H }) : r;
    expect(got.ok && got.state.bag.find((s) => s?.item === "potion")).toMatchObject({ by: "イルムガルト", count: 5 });
  });

  it("three at a time, and not without the materials or the money", () => {
    let p = player({ gold: 1000, bag: bag(["rusty-scrap", 20], ["charcoal", 10]) });
    for (let k = 0; k < MAX_ORDERS; k++) {
      const r = apply(p, { type: "order", commission: "gunter-ingot", roll: 0.5 });
      if (r.ok) p = r.state;
    }
    expect(apply(p, { type: "order", commission: "gunter-ingot", roll: 0.5 })).toEqual({ ok: false, reason: "TOO_MANY_ORDERS" });
    expect(apply(player({ gold: 1000 }), { type: "order", commission: "gunter-ingot", roll: 0.5 })).toEqual({ ok: false, reason: "MISSING_INPUTS" });
    expect(apply(player({ gold: 0, bag: bag(["rusty-scrap", 4], ["charcoal", 2]) }), { type: "order", commission: "gunter-ingot", roll: 0.5 })).toEqual({ ok: false, reason: "NO_GOLD" });
  });

  it("every commission is taken by a real craftsman, and costs less than buying it outright", () => {
    for (const job of COMMISSIONS) {
      expect(
        RESIDENTS.some((r) => r.name === job.craftsman),
        job.id,
      ).toBe(true);
      const outright = ITEMS[job.output.item].price * job.output.count;
      expect(job.fee, job.id).toBeLessThan(outright);
    }
  });
});
