// The shared shelves of one town's shops (economy.md §4.3–4.4): one Durable Object, so every
// purchase is taken off the shelf one at a time and two buyers can never both get the last loaf.
import { defineDurableState } from "void/durable";
import { makerAt } from "#/world/core/apply.ts";
import { ITEMS, type ItemId, type Quality } from "#/world/core/items.ts";
import { qualitiesOf } from "#/world/core/makers.ts";
import {
  wantsMore,
  batched,
  buyingPrice,
  emptyMarket,
  giveBack,
  moveStock,
  nextBatch,
  priceNow,
  restock,
  seedStock,
  stockOf,
  stockPrice,
  take,
  type MarketState,
  type Taken,
} from "#/world/core/market.ts";
import { SHOPS, type ShopId } from "#/world/core/shops.ts";

/** One line in a shop's window: a thing, its quality, what it costs now and how many are left (null: plenty). */
export interface Offer {
  item: ItemId;
  q: Quality;
  price: number;
  left: number | null;
  next: number | null;
}

const maker = (shop: string, item: ItemId) => makerAt(shop as ShopId, item);

/** The shelves now; a market that has just opened starts as if it had been running all day. */
function current(state: { market: MarketState }): MarketState {
  const now = Date.now();
  if (!state.market.since) state.market = { ...emptyMarket(now - 86_400_000), since: now };
  if (!state.market.stock) state.market = { ...state.market, stock: seedStock(SHOPS) };
  state.market = restock(state.market, now, maker);
  return state.market;
}

export const Market = defineDurableState({
  initialState: { market: emptyMarket(Date.now()) as MarketState },
  methods: {
    /** What a shop has now. `toClose`: minutes until its last keeper goes home (null if not soon). */
    look(context, shop: ShopId, toClose: number | null): Offer[] {
      const now = Date.now();
      const market = current(context.state);
      const offers: Offer[] = [];
      for (const item of SHOPS[shop].stock as readonly ItemId[]) {
        const by = ITEMS[item].made ? maker(shop, item) : undefined;
        const isBatched = batched(shop, item);
        for (const q of qualitiesOf(item, by)) {
          const left = isBatched ? (market.shelf[shop]?.[item]?.[q] ?? 0) : null;
          // a batch that is out comes in some qualities and not others: list only what is there, or the ordinary one as sold out
          if (isBatched && !left && q !== 1) continue;
          const price = isBatched ? priceNow(item, q, by, toClose, true) : stockPrice(market, shop, item, q, by);
          offers.push({ item, q, price, left: isBatched ? left : Math.floor(stockOf(market, shop, item)), next: isBatched ? nextBatch(shop, item, now) : null });
        }
      }
      return offers;
    },
    /** Take things off the shelf at the price the buyer saw. */
    take(context, shop: ShopId, item: ItemId, q: Quality, count: number, expected: number | undefined, toClose: number | null): Taken {
      current(context.state);
      const by = ITEMS[item].made ? maker(shop, item) : undefined;
      const price = batched(shop, item) ? priceNow(item, q, by, toClose, true) : stockPrice(context.state.market, shop, item, q, by);
      const result = take(context.state.market, shop, item, q, count, price, expected);
      if (result.ok) context.state.market = result.state;
      return result;
    },
    /** What the shop pays for each of these now (the things a player carries). */
    buying(context, shop: ShopId, items: ItemId[]): Record<string, number> {
      current(context.state);
      const rates = (SHOPS[shop] as { rates?: Partial<Record<string, number>> }).rates ?? {};
      return Object.fromEntries(items.map((i) => [i, buyingPrice(context.state.market, shop, i, rates[ITEMS[i].kind] ?? 1)]));
    },
    /** A player sells to the shop: what it pays for each now, and the stock goes up (back down with `unsell`). */
    sell(context, shop: ShopId, item: ItemId, count: number): number {
      current(context.state);
      const rate = (SHOPS[shop] as { rates?: Partial<Record<string, number>> }).rates?.[ITEMS[item].kind] ?? 1;
      if (!wantsMore(context.state.market, shop, item, count)) return 0;
      const price = buyingPrice(context.state.market, shop, item, rate);
      context.state.market = moveStock(context.state.market, shop, item, count);
      return price;
    },
    unsell(context, shop: ShopId, item: ItemId, count: number) {
      context.state.market = moveStock(context.state.market, shop, item, -count);
    },
    /** Put things back (the buyer could not pay or carry them). */
    giveBack(context, shop: ShopId, item: ItemId, q: Quality, count: number) {
      context.state.market = batched(shop, item) ? giveBack(context.state.market, shop, item, q, count) : moveStock(context.state.market, shop, item, count);
    },
  },
});

export default Market;
