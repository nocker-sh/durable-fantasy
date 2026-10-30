import type { MonsterKind, Spawn } from "#/world/core/monster-types"

export const MONSTER_KINDS: Record<string, MonsterKind> = {
  slime: {
    name: "スライム",
    hp: 30,
    def: 0,
    flee: 5,
    atk: 3,
    hit: 6,
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
    exp: 42,
    respawn: 120,
    look: "slime",
    color: 0xb69770,
    size: 1.15,
    drops: [
      { item: "rusty-scrap", chance: 0.55 },
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
    exp: 140,
    respawn: 150,
    look: "slime",
    color: 0x637e3e,
    size: 1.35,
    drops: [
      { item: "jelly", chance: 0.9 },
      { item: "blue-jelly", chance: 0.45 },
      { item: "herb", chance: 0.3 },
    ],
  },
  "ash-hare": {
    name: "灰うさぎ",
    hp: 72,
    def: 3,
    flee: 18,
    atk: 10,
    hit: 16,
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
  hare: { name: "野うさぎ", hp: 22, def: 0, flee: 25, atk: 0, hit: 0, exp: 7, respawn: 150, look: "hare", drops: [{ item: "soft-fur", chance: 0.55 }] },
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
  ...many({ map: "south-meadow", kind: "slime", n: 6, area: [28, 28, 44, 42] }),
  ...many({ map: "south-meadow", kind: "slime", n: 4, area: [8, 28, 20, 40], from: 6 }),
  ...many({ map: "south-meadow", kind: "blue-slime", n: 2, area: [36, 34, 44, 42] }),
  ...many({ map: "south-meadow", kind: "hare", n: 4, area: [30, 6, 44, 20] }),
  ...many({ map: "red-dunes", kind: "sand-slime", n: 2, area: [20, 17, 23, 20] }),
  ...many({ map: "red-dunes", kind: "sand-slime", n: 2, area: [32, 14, 35, 17], from: 2 }),
  ...many({ map: "forest-edge", kind: "blue-slime", n: 3, area: [36, 30, 39, 33] }),
  ...many({ map: "forest-edge", kind: "hare", n: 2, area: [9, 15, 12, 18] }),
  ...many({ map: "forest-edge", kind: "ash-hare", n: 2, area: [9, 15, 12, 18] }),
  ...many({ map: "deep-forest", kind: "moss-slime", n: 2, area: [15, 12, 18, 15] }),
  ...many({ map: "deep-forest", kind: "moss-slime", n: 2, area: [30, 36, 33, 39], from: 2 }),
  ...many({ map: "deep-forest", kind: "blue-slime", n: 2, area: [6, 27, 9, 30] }),
]

/** How far you strike from, in tiles. */
export const MELEE_REACH = 1.6
/**
 * A creature struck turns on the one who struck it and is theirs to finish for this long after their
 * last blow; others' blows glance off meanwhile. Left alone that long, it goes off and recovers.
 */
export const CLAIM_MS = 30_000
/** Stamina a fight costs when it is won. */
export const FIGHT_STAMINA = 2
