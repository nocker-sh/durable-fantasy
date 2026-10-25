// The town warehouse (game-system.md §5): Hilde keeps what you leave with her, a hundred places of it,
// for a small charge on each lot left (her living, houses.ts "預かり賃"); taking things back is free.
// Things keep as they were left: a worn tool stays worn. Open while she is at her counter (town/warehouse.ts).
import { emptyBag, type Bag } from "./bag.ts";

export const STORAGE_KEEPER = "ヒルデ";
export const STORAGE_SIZE = 100;
/** gold for each lot left with her */
export const STORE_FEE = 4;

export const emptyStorage = (): Bag => emptyBag(STORAGE_SIZE);
