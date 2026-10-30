import { DEFAULT_NAME, STARTING_GOLD, HOTBAR_SIZE, TOWN_SPAWN } from "#/world/core/player-rules"
import type { PlayerState } from "#/world/core/player-types"
import { STARTING_POINTS } from "#/world/core/growth-rules"
import { startingStats } from "#/world/core/starting-stats"
import { addItem } from "#/world/core/add-item"
import { emptyBag } from "#/world/core/empty-bag"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { derive } from "#/world/core/derive"
import { emptyLife } from "#/world/core/empty-life"
import { emptyStorage } from "#/world/core/storage/empty-storage"

/** A new traveller: tired from the road (60% HP), with a little money and bread. */
export function newPlayer(name = DEFAULT_NAME, look = 0): PlayerState {
  const base: Pick<
    PlayerState,
    "version" | "revision" | "name" | "profileComplete" | "look" | "neck" | "neckRamp" | "level" | "exp" | "statPoints" | "stats" | "gold" | "bag" | "equipment" | "hotbar" | "savePoint"
  > = {
    version: 3,
    revision: 0,
    name,
    profileComplete: false,
    look,
    neck: "muffler",
    neckRamp: "cRed",
    level: 1,
    exp: 0,
    statPoints: STARTING_POINTS,
    stats: startingStats(),
    gold: STARTING_GOLD,
    bag: addItem({ bag: emptyBag(), item: "rye-bread", count: 2 }) ?? emptyBag(),
    // a branch picked up on the way: better than nothing against a slime
    equipment: { ...emptyEquipment(), weapon: "wooden-stick" },
    hotbar: ["rye-bread", ...Array.from({ length: HOTBAR_SIZE - 1 }, () => null)],
    savePoint: TOWN_SPAWN,
  }
  const d = derive(base)
  return {
    ...base,
    worn: {},
    hp: Math.floor(d.maxHp * 0.6),
    hpAt: 0,
    spAt: 0,
    sitting: false,
    ready: {},
    sp: d.maxSp,
    stamina: 70,
    full: 0,
    fullAt: 0,
    warmUntil: 0,
    focusAt: 0,
    focusUntil: 0,
    life: emptyLife(),
    orders: [],
    friends: {},
    errands: [],
    boughtOn: {},
    storage: emptyStorage(),
    party: null,
    threads: [],
  }
}
