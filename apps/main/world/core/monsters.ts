import type { MonsterKind, Spawn } from "#/world/core/monster-types"
import { draft as forestSpider } from "#/world/core/bestiary/forest-spider"
import { draft as duneSidewinder } from "#/world/core/bestiary/dune-sidewinder"
import { draft as passStrider } from "#/world/core/bestiary/pass-strider"

export const MONSTER_KINDS: Record<string, MonsterKind> = {
  slime: {
    name: "スライム",
    hp: 30,
    def: 0,
    flee: 5,
    atk: 3,
    hit: 6,
    interval: 2000,
    exp: 9,
    respawn: 90,
    look: "slime",
    color: 0x8ac06a,
    drops: [
      { item: "jelly", chance: 0.8 },
      { item: "herb", chance: 0.15 },
    ],
  },
  "blue-slime": {
    name: "青いスライム",
    hp: 48,
    def: 2,
    flee: 8,
    atk: 7,
    hit: 10,
    interval: 1900,
    exp: 15,
    respawn: 120,
    look: "slime",
    color: 0x6a9ac8,
    size: 1.2,
    drops: [
      { item: "blue-jelly", chance: 0.6 },
      { item: "jelly", chance: 0.4 },
    ],
  },
  "sand-slime": {
    name: "砂スライム",
    hp: 96,
    def: 4,
    flee: 12,
    atk: 12,
    hit: 18,
    interval: 2100,
    exp: 42,
    respawn: 120,
    look: "slime",
    color: 0xb69770,
    size: 1.15,
    drops: [
      { item: "rusty-scrap", chance: 0.55 },
      { item: "hardened-scrap", chance: 0.15 },
      { item: "jelly", chance: 0.65 },
    ],
  },
  "moss-slime": {
    name: "苔スライム",
    hp: 260,
    def: 8,
    flee: 24,
    atk: 22,
    hit: 38,
    interval: 2400,
    exp: 140,
    respawn: 150,
    look: "slime",
    color: 0x637e3e,
    size: 1.35,
    drops: [
      { item: "jelly", chance: 0.9 },
      { item: "blue-jelly", chance: 0.45 },
      { item: "herb", chance: 0.3 },
      { item: "root-resin", chance: 0.3 },
    ],
  },
  "ash-hare": {
    name: "灰うさぎ",
    hp: 72,
    def: 3,
    flee: 18,
    atk: 10,
    hit: 16,
    interval: 1500,
    exp: 28,
    respawn: 150,
    look: "hare",
    color: 0x85858b,
    size: 1.25,
    drops: [
      { item: "sharp-fang", chance: 0.65 },
      { item: "soft-fur", chance: 0.35 },
    ],
  },
  hare: { name: "野うさぎ", hp: 22, def: 0, flee: 25, atk: 0, hit: 0, interval: 2000, exp: 7, respawn: 150, look: "hare", drops: [{ item: "soft-fur", chance: 0.55 }] },
  "iron-sand-slime": {
    name: "鉄砂スライム",
    hp: 520,
    def: 13,
    flee: 22,
    atk: 25,
    hit: 30,
    interval: 2600,
    exp: 260,
    respawn: 60,
    look: "slime",
    color: 0x82705e,
    size: 1.35,
    drops: [
      { item: "hardened-scrap", chance: 0.8 },
      { item: "rusty-scrap", chance: 0.7 },
      { item: "herb", chance: 0.3 },
      { item: "old-cog", chance: 0.05 },
    ],
  },
  "resin-slime": {
    name: "樹脂スライム",
    hp: 950,
    def: 17,
    flee: 30,
    atk: 31,
    hit: 40,
    interval: 2800,
    exp: 550,
    respawn: 60,
    look: "slime",
    color: 0x957b49,
    size: 1.4,
    drops: [
      { item: "root-resin", chance: 0.85 },
      { item: "blue-herb", chance: 0.4 },
      { item: "herb", chance: 0.4 },
    ],
  },
  "old-moss-slime": {
    name: "古苔スライム",
    hp: 1800,
    def: 23,
    flee: 38,
    atk: 42,
    hit: 50,
    interval: 3000,
    exp: 1100,
    respawn: 60,
    look: "slime",
    color: 0x426858,
    size: 1.7,
    drops: [
      { item: "dense-jelly", chance: 0.75 },
      { item: "root-resin", chance: 0.8 },
      { item: "blue-herb", chance: 0.6 },
      { item: "hardened-scrap", chance: 0.35 },
    ],
  },
  // the pass's grazer, let out of the drafts (.docs/settings/monsters/monster-pass-strider.md)
  "pass-strider": passStrider.kind,
  "dune-sidewinder": duneSidewinder.kind,
  "forest-spider": forestSpider.kind,
}

const many = (inputProps: { map: string; kind: Spawn["kind"]; n: number; area: Spawn["area"]; from?: number }): Spawn[] => {
  const map = inputProps.map
  const kind = inputProps.kind
  const n = inputProps.n
  const area = inputProps.area
  const from = inputProps.from === undefined ? 0 : inputProps.from
  return Array.from({ length: n }, (_, i) => ({ id: `${map}-${kind}-${from + i}`, map, kind, area }))
}

export const SPAWNS: readonly Spawn[] = [
  // the east slimes keep to their own patch (map-south-meadow「meadow-slime-east」), apart from the blue slimes' damp hollow,
  // so a newcomer clicking the nearest slime does not walk into a fight the starting stick cannot win
  ...many({ map: "south-meadow", kind: "slime", n: 6, area: [28, 28, 36, 36] }),
  ...many({ map: "south-meadow", kind: "slime", n: 4, area: [8, 24, 20, 36], from: 6 }),
  ...many({ map: "south-meadow", kind: "blue-slime", n: 2, area: [35, 33, 43, 41] }),
  ...many({ map: "south-meadow", kind: "hare", n: 4, area: [28, 12, 42, 26] }),
  ...many({ map: "red-dunes", kind: "sand-slime", n: 2, area: [20, 17, 23, 20] }),
  ...many({ map: "red-dunes", kind: "sand-slime", n: 2, area: [32, 14, 35, 17], from: 2 }),
  ...many({ map: "forest-edge", kind: "blue-slime", n: 3, area: [36, 30, 39, 33] }),
  ...many({ map: "forest-edge", kind: "hare", n: 2, area: [9, 15, 12, 18] }),
  // the highland's grass north of the road, clear of the road over the pass
  ...many({ map: "grass-highland", kind: "hare", n: 2, area: [10, 7, 13, 10] }),
  ...many({ map: "grass-highland", kind: "hare", n: 2, area: [37, 7, 40, 10], from: 2 }),
  ...many({ map: "forest-edge", kind: "ash-hare", n: 2, area: [9, 15, 12, 18] }),
  ...many({ map: "deep-forest", kind: "moss-slime", n: 2, area: [15, 12, 18, 15] }),
  ...many({ map: "deep-forest", kind: "moss-slime", n: 2, area: [30, 36, 33, 39], from: 2 }),
  ...many({ map: "deep-forest", kind: "blue-slime", n: 2, area: [6, 27, 9, 30] }),
  ...many({ map: "red-dunes", kind: "iron-sand-slime", n: 1, area: [12, 20, 15, 23] }),
  ...many({ map: "red-dunes", kind: "iron-sand-slime", n: 1, area: [22, 22, 25, 25], from: 1 }),
  ...many({ map: "red-dunes", kind: "iron-sand-slime", n: 1, area: [28, 24, 31, 27], from: 2 }),
  ...many({ map: "red-dunes", kind: "iron-sand-slime", n: 1, area: [34, 26, 37, 29], from: 3 }),
  ...many({ map: "deep-forest", kind: "resin-slime", n: 1, area: [12, 15, 15, 18] }),
  ...many({ map: "deep-forest", kind: "resin-slime", n: 1, area: [7, 16, 10, 19], from: 1 }),
  ...many({ map: "deep-forest", kind: "resin-slime", n: 1, area: [35, 26, 38, 29], from: 2 }),
  ...many({ map: "deep-forest", kind: "resin-slime", n: 1, area: [23, 39, 26, 42], from: 3 }),
  ...many({ map: "deep-forest", kind: "old-moss-slime", n: 1, area: [24, 24, 27, 27] }),
  ...many({ map: "deep-forest", kind: "old-moss-slime", n: 1, area: [29, 26, 32, 29], from: 1 }),
  ...many({ map: "deep-forest", kind: "old-moss-slime", n: 1, area: [40, 28, 43, 31], from: 2 }),
  ...many({ map: "deep-forest", kind: "old-moss-slime", n: 1, area: [21, 29, 24, 32], from: 3 }),
  ...many({ map: "deep-forest", kind: "old-moss-slime", n: 1, area: [22, 34, 25, 37], from: 4 }),
  ...many({ map: "deep-forest", kind: "old-moss-slime", n: 1, area: [14, 38, 17, 41], from: 5 }),
  // the grassland west of the cart road over the pass, clear of the road and its exits
  ...many({ map: "deep-forest", kind: "forest-spider", n: 1, area: [32, 8, 35, 11] }),
  ...many({ map: "deep-forest", kind: "forest-spider", n: 1, area: [30, 36, 33, 39], from: 1 }),
  ...many({ map: "red-dunes", kind: "dune-sidewinder", n: 1, area: [8, 30, 11, 33] }),
  ...many({ map: "red-dunes", kind: "dune-sidewinder", n: 1, area: [38, 36, 41, 39], from: 1 }),
  ...many({ map: "mountain-pass", kind: "pass-strider", n: 1, area: [6, 26, 12, 32] }),
  ...many({ map: "mountain-pass", kind: "pass-strider", n: 1, area: [6, 36, 12, 42], from: 1 }),
]

/** How far you strike from, in tiles. */
export const MELEE_REACH = 1.6
/**
 * A creature struck turns on the one who struck it and is theirs to finish for this long after their
 * last blow; others' blows glance off meanwhile. Left alone that long, it goes off and recovers.
 */
export const CLAIM_MS = 30_000
/**
 * The most of a creature's blows one strike settles. Its blows are timed (MonsterKind.interval) but only
 * land when its opponent strikes again, so a long pause is not charged in full (backlog.md).
 */
export const COUNTER_MAX = 3
/** A creature's time between blows when its kind does not name one. */
export const COUNTER_INTERVAL = 2000
/** Stamina a fight costs when it is won. */
export const FIGHT_STAMINA = 1
