// Shared shop stock (economy.md §4.3–4.4). Things baked or cooked in batches come out at set
// times in set numbers; everyone — players and residents — buys from the same shelf, and once it is
// empty it is empty until the next batch. Near closing time the price comes down. Everything else in
// the shops is kept in stock and sold at its list price. Pure: the market Durable Object keeps the
// state and runs these one at a time.
import { ITEMS, type ItemId, type Quality } from "./items.ts";
import { MAKERS, priceOf } from "./makers.ts";

/** A batch: when it comes out (minutes past midnight, Japan time) and how many. */
export interface Batch {
  at: readonly number[];
  count: number;
  /** residents who buy some, minutes after it comes out */ eaten?: { after: number; count: number };
}

const H = (h: number, m = 0) => h * 60 + m;

/** What comes out in batches, shop by shop. */
export const BATCHES: Record<string, Partial<Record<ItemId, Batch>>> = {
  bakery: {
    "rye-bread": { at: [H(3), H(6), H(9)], count: 12, eaten: { after: 40, count: 4 } },
    roll: { at: [H(6)], count: 20, eaten: { after: 30, count: 8 } },
    "apple-pie": { at: [H(9)], count: 6, eaten: { after: 90, count: 2 } },
    "honey-cake": { at: [H(5, 30)], count: 8, eaten: { after: 60, count: 3 } },
  },
  inn: {
    stew: { at: [H(15), H(20)], count: 10, eaten: { after: 60, count: 3 } },
    "mushroom-stew": { at: [H(18)], count: 8, eaten: { after: 60, count: 2 } },
    "cabbage-soup": { at: [H(16), H(23)], count: 12, eaten: { after: 45, count: 4 } },
    "mushroom-soup": { at: [H(17)], count: 8, eaten: { after: 60, count: 2 } },
  },
  // the monk boils his potions before he wakes the chapel; only a few a day
  general: { potion: { at: [H(17)], count: 3 } },
  // street sellers: what they bring out when they set up, and the residents who buy a little
  "fried-dough": { "fried-dough": { at: [H(16, 30)], count: 20, eaten: { after: 60, count: 6 } } },
  "old-clothes": { "cloth-hat": { at: [H(20)], count: 2 }, "traveller-coat": { at: [H(20)], count: 1 }, "wool-cape": { at: [H(20)], count: 1 } },
  potato: { "baked-potato": { at: [H(16)], count: 16, eaten: { after: 60, count: 5 } } },
  chestnuts: { "roast-chestnuts": { at: [H(16)], count: 24, eaten: { after: 90, count: 8 } } },
  peddler: { "blue-potion": { at: [H(11)], count: 2 }, "silver-ring": { at: [H(11)], count: 1 }, "smoked-fish": { at: [H(11)], count: 6 }, "herb-tea": { at: [H(11)], count: 6 } },
  flowers: { "meadow-flower": { at: [H(17)], count: 12, eaten: { after: 60, count: 3 } } },
  "hot-water": { "hot-water": { at: [H(17)], count: 40, eaten: { after: 30, count: 10 } } },
  "dawn-market": { egg: { at: [H(6)], count: 18, eaten: { after: 30, count: 6 } }, "hot-milk": { at: [H(6)], count: 10, eaten: { after: 40, count: 3 } } },
  firewood: { firewood: { at: [H(13)], count: 20, eaten: { after: 60, count: 6 } }, charcoal: { at: [H(13)], count: 10, eaten: { after: 60, count: 2 } }, log: { at: [H(13)], count: 6 } },
  tavern: {
    "fish-soup": { at: [H(17), H(22)], count: 10, eaten: { after: 60, count: 3 } },
    "cheese-toast": { at: [H(16), H(19), H(23)], count: 8, eaten: { after: 40, count: 3 } },
  },
};

/** Stock by shop and item: how many of each quality are on the shelf. */
export type Shelf = Record<string, Partial<Record<ItemId, [number, number, number, number]>>>;
export interface MarketState {
  shelf: Shelf;
  /** time (ms) the shelves were last brought up to date */
  at: number;
  /** when this market opened */
  since?: number;
  /** everything else the shops keep, by shop and item: how many are in stock (economy.md §4.1) */
  stock?: Record<string, Partial<Record<ItemId, number>>>;
}

// ---------------------------------------------------------------- stock and price (economy.md §4.1)
/** How many of a thing a shop likes to keep: plenty of cheap things, a few dear ones. */
export function target(item: ItemId): number {
  const p = ITEMS[item].price;
  return p <= 10 ? 40 : p <= 40 ? 20 : p <= 150 ? 8 : 4;
}

/** The price against the list price for a stock level: dearer when it runs low, cheaper when it piles up, within three tenths. */
export function stockFactor(stock: number, item: ItemId): number {
  const x = stock / target(item);
  return 1 + 0.3 * Math.max(-1, Math.min(1, 1 - x));
}

/** A shop's stock of a thing now. */
export const stockOf = (state: MarketState, shop: string, item: ItemId) => state.stock?.[shop]?.[item] ?? target(item);

/**
 * An hour in the life of a shop's stock: the producers bring it back towards what the shop likes to
 * keep (the farmer's cabbages, the smith's work), the residents buy some (more of food, little of
 * gear), so prices move a little through the day and when players buy or sell a lot.
 */
function hourOfStock(stock: number, item: ItemId, shop: string, hour: number): number {
  const t = target(item);
  const eaten = ITEMS[item].use ? 0.06 : 0.02;
  const wobble = hash(hour, shop.length, item.length) - 0.5;
  return Math.max(0, stock + (t - stock) * 0.12 - t * eaten * (1 + wobble));
}

export const emptyMarket = (at: number): MarketState => ({ shelf: {}, at });

const DAY = 86_400_000;
const JST = 9 * 3_600_000;
/** ms of the given minute-of-day on the day of `ms`, Japan time */
const dayStart = (ms: number) => Math.floor((ms + JST) / DAY) * DAY - JST;

/** Deterministic 0..1 from a few numbers. */
function hash(...n: number[]): number {
  let h = 2166136261;
  for (const x of n) {
    h ^= Math.floor(x) & 0xffffffff;
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100_000) / 100_000;
}

/** How a batch falls into qualities: by the maker's hand, the same for everyone. */
export function splitBatch(item: ItemId, by: string, count: number, seed: number): [number, number, number, number] {
  const out: [number, number, number, number] = [0, 0, 0, 0];
  if (!ITEMS[item].made) {
    out[1] = count;
    return out;
  }
  const w = MAKERS[by]?.[item]?.tiers ?? [0, 1, 0, 0];
  const total = w.reduce((a, b) => a + b, 0) || 1;
  for (let k = 0; k < count; k++) {
    let r = hash(seed, k) * total;
    let q = 0;
    while (q < 3 && r >= w[q]) {
      r -= w[q];
      q++;
    }
    out[q]++;
  }
  return out;
}

/** Every batch and every resident's purchase between two times, in order. */
type Happening = { t: number; shop: string; item: ItemId; batch: Batch; eat: boolean; first: boolean };
function happenings(from: number, to: number): Happening[] {
  const out: Happening[] = [];
  if (to <= from) return out;
  // never look back further than a day: the shelf would be full of stale bread anyway
  const start = Math.max(from, to - DAY);
  for (let d = dayStart(start); d <= to; d += DAY) {
    for (const [shop, items] of Object.entries(BATCHES))
      for (const [item, batch] of Object.entries(items) as [ItemId, Batch][]) {
        batch.at.forEach((m, k) => {
          const t = d + m * 60_000;
          if (t > start && t <= to) out.push({ t, shop, item, batch, eat: false, first: k === 0 });
          const te = t + (batch.eaten?.after ?? 0) * 60_000;
          if (batch.eaten && te > start && te <= to) out.push({ t: te, shop, item, batch, eat: true, first: false });
        });
      }
  }
  return out.sort((a, b) => a.t - b.t);
}

/** Bring the shelves up to `now`: batches come out, residents buy their share, old stock is thrown to the pigs. */
export function restock(state: MarketState, now: number, makerOf: (shop: string, item: ItemId) => string): MarketState {
  if (now <= state.at) return state;
  const shelf: Shelf = structuredClone(state.shelf);
  for (const h of happenings(state.at, now)) {
    const row = (shelf[h.shop] ??= {});
    const have = row[h.item] ?? [0, 0, 0, 0];
    if (h.eat) {
      // residents buy what they always buy, the ordinary ones first
      let left = h.batch.eaten!.count;
      for (const q of [1, 0, 2, 3]) {
        const take = Math.min(left, have[q]);
        have[q] -= take;
        left -= take;
      }
    } else {
      // the day's first batch: what is left from yesterday goes to the pigs; then the fresh one goes on the shelf
      const fresh = splitBatch(h.item, makerOf(h.shop, h.item), h.batch.count, h.t / 60_000);
      for (let q = 0; q < 4; q++) have[q] = (h.first ? 0 : have[q]) + fresh[q];
    }
    row[h.item] = have as [number, number, number, number];
  }
  // and the stock of everything else, an hour at a time (never more than two days' worth)
  const stock: NonNullable<MarketState["stock"]> = structuredClone(state.stock ?? {});
  const fromHour = Math.max(Math.floor(state.at / 3_600_000), Math.floor(now / 3_600_000) - 48);
  for (let h = fromHour + 1; h <= Math.floor(now / 3_600_000); h++) {
    for (const [shop, row] of Object.entries(stock)) for (const item of Object.keys(row) as ItemId[]) row[item] = hourOfStock(row[item]!, item, shop, h);
  }
  return { ...state, shelf, stock, at: now };
}

/** The price of a kept thing now, by its stock (made things by their quality and maker too). */
export function stockPrice(state: MarketState, shop: string, item: ItemId, q: Quality, by: string | undefined): number {
  return Math.max(1, Math.round(priceOf(item, q, by) * stockFactor(stockOf(state, shop, item), item)));
}

/** What a shop pays for a thing: under half its own price for it now (so it never pays more than it sells for). */
export function buyingPrice(state: MarketState, shop: string, item: ItemId, rate = 1): number {
  return Math.max(1, Math.floor(ITEMS[item].price * stockFactor(stockOf(state, shop, item), item) * 0.45 * rate));
}

/** A shop stops buying a thing once it has three times what it likes to keep (money is not printed without end). */
export const wantsMore = (state: MarketState, shop: string, item: ItemId, count: number) => stockOf(state, shop, item) + count <= target(item) * 3;

/** Every shop's kept things at the stock it likes, for a market just opened. */
export function seedStock(shops: Record<string, { stock: readonly ItemId[] }>): NonNullable<MarketState["stock"]> {
  const out: NonNullable<MarketState["stock"]> = {};
  for (const [shop, s] of Object.entries(shops)) for (const item of s.stock) if (!batched(shop, item)) (out[shop] ??= {})[item] = target(item);
  return out;
}

/** Change a shop's stock of a thing (players buying take it away, players selling add to it). */
export function moveStock(state: MarketState, shop: string, item: ItemId, delta: number): MarketState {
  const stock: NonNullable<MarketState["stock"]> = structuredClone(state.stock ?? {});
  const row = (stock[shop] ??= {});
  row[item] = Math.max(0, (row[item] ?? target(item)) + delta);
  return { ...state, stock };
}

/** How far the price may have moved since the buyer looked before they are asked to look again. */
export const SLIPPAGE = 0.05;

/** Is this one of the things that comes out in batches (and so can run out)? */
export const batched = (shop: string, item: ItemId) => !!BATCHES[shop]?.[item];

/**
 * The price today: the list price, less at closing time — a tenth off in the last hour, three
 * tenths in the last half hour (`toClose` in minutes, or null when the shop is not closing soon).
 */
export function priceNow(item: ItemId, q: Quality, by: string | undefined, toClose: number | null, isBatched: boolean): number {
  const base = priceOf(item, q, by);
  if (!isBatched || toClose === null || toClose > 60) return base;
  return Math.max(1, Math.round(base * (toClose <= 30 ? 0.7 : 0.9)));
}

export type Taken = { ok: true; state: MarketState; price: number } | { ok: false; reason: "SOLD_OUT" | "PRICE_CHANGED" };

/** Take `count` of a quality off the shelf at the price the buyer saw. */
export function take(state: MarketState, shop: string, item: ItemId, q: Quality, count: number, price: number, expected: number | undefined): Taken {
  if (expected !== undefined && Math.abs(price - expected) > Math.max(1, expected * SLIPPAGE)) return { ok: false, reason: "PRICE_CHANGED" };
  if (!batched(shop, item)) {
    // a kept thing: stock goes down, the price for the next one up
    if (stockOf(state, shop, item) < count) return { ok: false, reason: "SOLD_OUT" };
    return { ok: true, state: moveStock(state, shop, item, -count), price };
  }
  const have = state.shelf[shop]?.[item]?.[q] ?? 0;
  if (have < count) return { ok: false, reason: "SOLD_OUT" };
  const shelf: Shelf = structuredClone(state.shelf);
  shelf[shop]![item]![q] -= count;
  return { ok: true, state: { ...state, shelf }, price };
}

/** Put things back on the shelf (the buyer could not pay or carry them after all). */
export function giveBack(state: MarketState, shop: string, item: ItemId, q: Quality, count: number): MarketState {
  if (!batched(shop, item)) return state;
  const shelf: Shelf = structuredClone(state.shelf);
  const row = (shelf[shop] ??= {});
  const have = row[item] ?? [0, 0, 0, 0];
  have[q] += count;
  row[item] = have as [number, number, number, number];
  return { ...state, shelf };
}

/** When the next batch of something comes out, from `now` (ms). */
export function nextBatch(shop: string, item: ItemId, now: number): number | null {
  const b = BATCHES[shop]?.[item];
  if (!b) return null;
  const d = dayStart(now);
  const times = [...b.at.map((m) => d + m * 60_000), ...b.at.map((m) => d + DAY + m * 60_000)].filter((t) => t > now);
  return Math.min(...times);
}
