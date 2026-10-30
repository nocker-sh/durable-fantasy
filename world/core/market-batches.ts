import { batchMinutes as H } from "#/world/core/batch-minutes"
import type { ItemId } from "#/world/core/items/catalog"
import type { Batch } from "#/world/core/market-types"

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
}
