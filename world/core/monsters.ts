// The creatures outside town (world.md: descendants of war-made creatures, ordinary animals now;
// game-system.md §8). Slimes bounce about the meadow on their own business and never come for you,
// though one that is struck strikes back;
// beaten, a slime bursts into little ones that scatter and come back together later, and a hare
// runs off into the grass. Where each one is follows from the clock alone, so the server and every
// player see it in the same place without sending positions about.
import type { ItemId } from "./items.ts"

export interface MonsterKind {
  name: string
  hp: number
  def: number
  flee: number
  /** how hard and how surely it strikes back when struck (0: it only runs) */
  atk: number
  hit: number
  exp: number
  drops: readonly { item: ItemId; chance: number }[]
  /** seconds before it is back after being beaten */
  respawn: number
  /** how it looks (scene) */
  look: "slime" | "hare"
  color?: number
  size?: number
}

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

export interface Spawn {
  id: string
  map: string
  kind: keyof typeof MONSTER_KINDS
  /** where it wanders, in tiles */ area: readonly [number, number, number, number]
}

const many = (map: string, kind: Spawn["kind"], n: number, area: Spawn["area"], from = 0): Spawn[] => Array.from({ length: n }, (_, i) => ({ id: `${map}-${kind}-${from + i}`, map, kind, area }))

export const SPAWNS: readonly Spawn[] = [
  ...many("south-meadow", "slime", 6, [28, 28, 44, 42]),
  ...many("south-meadow", "slime", 4, [8, 28, 20, 40], 6),
  ...many("south-meadow", "blue-slime", 2, [36, 34, 44, 42]),
  ...many("south-meadow", "hare", 4, [30, 6, 44, 20]),
  ...many("forest-edge", "blue-slime", 3, [36, 30, 39, 33]),
  ...many("forest-edge", "hare", 2, [9, 15, 12, 18]),
  ...many("forest-edge", "ash-hare", 2, [9, 15, 12, 18]),
  ...many("deep-forest", "moss-slime", 2, [15, 12, 18, 15]),
  ...many("deep-forest", "moss-slime", 2, [30, 36, 33, 39], 2),
  ...many("deep-forest", "blue-slime", 2, [6, 27, 9, 30]),
]

export const spawnOf = (id: string) => SPAWNS.find((s) => s.id === id)

/** How far you strike from, in tiles. */
export const MELEE_REACH = 1.6
/**
 * A creature struck turns on the one who struck it and is theirs to finish for this long after their
 * last blow; others' blows glance off meanwhile. Left alone that long, it goes off and recovers.
 */
export const CLAIM_MS = 30_000
/** Stamina a fight costs when it is won. */
export const FIGHT_STAMINA = 2

function hash(a: string, n: number): number {
  let h = 2166136261 ^ n
  for (const c of a) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 13
  h = Math.imul(h, 0x5bd1e995)
  h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

/**
 * They mostly sit where they are, quivering. Every twenty seconds or so one shuffles a short way
 * about its resting place (about a tile), taking two seconds over it; every five minutes or so it
 * settles somewhere else in its area.
 */
const PERIOD = 20_000,
  MOVE = 2_000,
  SETTLE = 15

/** Where it settles for a while: a point in its area; `free` keeps it off walls and water. */
function homeAt(s: Spawn, stay: number, free: (x: number, z: number) => boolean): [number, number] {
  const [x0, z0, x1, z1] = s.area
  for (let k = 0; k < 6; k++) {
    const x = x0 + hash(s.id, stay * 7 + k) * (x1 - x0),
      z = z0 + hash(s.id, stay * 7 + k + 3) * (z1 - z0)
    if (free(x, z)) return [x, z]
  }
  return [(x0 + x1) / 2, (z0 + z1) / 2]
}

/** A resting point for one stretch of time: a little way from where it has settled. */
function restAt(s: Spawn, seg: number, free: (x: number, z: number) => boolean): [number, number] {
  const [hx, hz] = homeAt(s, Math.floor(seg / SETTLE), free)
  const [x0, z0, x1, z1] = s.area
  const x = Math.min(x1, Math.max(x0, hx + (hash(s.id, seg * 11 + 1) - 0.5) * 1.2)),
    z = Math.min(z1, Math.max(z0, hz + (hash(s.id, seg * 11 + 2) - 0.5) * 1.2))
  return free(x, z) ? [x, z] : [hx, hz]
}

/** Where it is at time `t` (ms), and whether it is on the move. */
export function monsterAt(s: Spawn, t: number, free: (x: number, z: number) => boolean = () => true): { x: number; z: number; moving: boolean } {
  // each has its own beat, so they do not all shuffle at once
  const tt = t + hash(s.id, 99) * PERIOD
  const seg = Math.floor(tt / PERIOD),
    into = tt - seg * PERIOD
  const a = restAt(s, seg - 1, free),
    b = restAt(s, seg, free)
  return between(a, b, into)
}

function between(a: [number, number], b: [number, number], into: number) {
  // a short shuffle takes two seconds; settling somewhere new, as long as its unhurried pace needs
  const k = Math.min(1, into / Math.max(MOVE, Math.hypot(b[0] - a[0], b[1] - a[1]) * 900))
  return { x: a[0] + (b[0] - a[0]) * k, z: a[1] + (b[1] - a[1]) * k, moving: k < 1 }
}

/** A scene's view of the same motion, retaining only current and adjacent resting points.
 * The walkability function must remain stable for this instance's lifetime.
 */
export class MonsterMotion {
  private readonly points = new Map<number, [number, number]>()
  private readonly phase: number

  constructor(
    private readonly spawn: Spawn,
    private readonly free: (x: number, z: number) => boolean,
  ) {
    this.phase = hash(spawn.id, 99) * PERIOD
  }

  private rest(segment: number): [number, number] {
    const hit = this.points.get(segment)
    if (hit) return hit
    const point = restAt(this.spawn, segment, this.free)
    this.points.set(segment, point)
    if (this.points.size > 3) this.points.delete(this.points.keys().next().value!)
    return point
  }

  at(time: number) {
    const t = time + this.phase
    const segment = Math.floor(t / PERIOD)
    return between(this.rest(segment - 1), this.rest(segment), t - segment * PERIOD)
  }
}

/** What a beaten one leaves: each drop rolled on its own (rolls from the server). */
export function dropsOf(kind: MonsterKind, rolls: readonly number[]): ItemId[] {
  return kind.drops.flatMap((d, i) => ((rolls[i] ?? 1) < d.chance ? [d.item] : []))
}
