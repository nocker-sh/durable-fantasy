import type { Cell, MapDefinition, Warp } from "#/world/maps/types"
import { indoorMaps } from "#/world/maps/indoor-maps"
import { RESIDENTS } from "#/world/town/residents"
import { workSpot } from "#/world/town/work-spot"
import { getSpotCell } from "#/world/maps/get-spot-cell"
import craft from "#resources/world/maps/phanthiet-craft"
import gate from "#resources/world/maps/phanthiet-gate"
import market from "#resources/world/maps/phanthiet-market"
import town from "#resources/world/maps/phanthiet"
import south_meadow from "#resources/world/maps/south-meadow"
import red_dunes from "#resources/world/maps/red-dunes"
import sea_cliff from "#resources/world/maps/sea-cliff"
import net_sheds from "#resources/world/maps/net-sheds"
import forest_edge from "#resources/world/maps/forest-edge"
import deep_forest from "#resources/world/maps/deep-forest"
import quynhon_gate from "#resources/world/maps/quynhon-gate"
import mountain_pass from "#resources/world/maps/mountain-pass"
import hue_gate from "#resources/world/maps/hue-gate"
import { OPPOSITE } from "#/world/maps/grid"
import { across } from "#/world/maps/across"
import { squareOf } from "#/world/maps/square-of"
import { type Side } from "#/world/maps/grid-types"
import { layoutOf } from "#/world/maps/layouts"
import { INTERIORS } from "#/world/town/interiors"
import { keeperPlace } from "#/world/town/keeper-place"
import { keepersOf } from "#/world/town/keepers-of"
import { outsideDoor } from "#/world/town/outside-door"

type Grid = { size: number; rows: string[]; places?: Record<string, number[]> }
const grid = (g: Grid) => ({ size: g.size, rows: g.rows, npcs: [], places: (g.places ?? {}) as unknown as Record<string, Cell> })
/** Every resident's sprites are baked into one directory, whichever map they live on. */
const SPRITES = "/tmp/sprites"

const STREETS = {
  phanthiet: {
    id: "phanthiet",
    name: "ファンティエット ― 広場",
    kind: "town",
    ...grid(town),
    warps: [],
    spawn: [38, 80],
    assets: { sprites: SPRITES },
  },
  "phanthiet-market": {
    id: "phanthiet-market",
    name: "ファンティエット ― 商店通り",
    kind: "town",
    ...grid(market),
    warps: [],
    spawn: [48, 50],
    assets: { sprites: SPRITES },
  },
  "phanthiet-craft": {
    id: "phanthiet-craft",
    name: "ファンティエット ― 職人通り",
    kind: "town",
    ...grid(craft),
    warps: [],
    spawn: [40, 46],
    assets: { sprites: SPRITES },
  },
  "phanthiet-gate": {
    id: "phanthiet-gate",
    name: "ファンティエット ― 南門",
    kind: "town",
    ...grid(gate),
    warps: [],
    spawn: [48, 40],
    assets: { sprites: SPRITES },
  },
} satisfies Record<string, MapDefinition>

/** The land outside town: a map to a square of the world grid (grid.ts), joined to its neighbours there. */
const field = (id: string, name: string, g: Grid): MapDefinition => ({
  id,
  name,
  kind: "field",
  ...grid(g),
  warps: [],
  spawn: [48, 48],
  assets: { sprites: SPRITES },
})
const FIELDS: MapDefinition[] = [
  field("south-meadow", "南の草原", south_meadow),
  field("red-dunes", "赤い砂丘", red_dunes),
  field("sea-cliff", "海沿いの崖道", sea_cliff),
  field("net-sheds", "浜の網小屋", net_sheds),
  field("forest-edge", "樹海の入り口", forest_edge),
  field("deep-forest", "樹海の奥", deep_forest),
  field("quynhon-gate", "クイニョンの門前", quynhon_gate),
  field("mountain-pass", "峠道", mountain_pass),
  field("hue-gate", "フエの門前", hue_gate),
]

/** Where a map's roads run off one of its sides, along that side, in cells (scene/ground-layouts.ts). */
function roadEnds(id: string, side: Side): number[] {
  const out: number[] = []
  for (const r of layoutOf(id).roads)
    for (const entry of [r.pts[0], r.pts[r.pts.length - 1]]) {
      const x = entry[0]
      const z = entry[1]

      const off = side === "w" ? x < 0.5 : side === "e" ? x > 47.5 : side === "n" ? z < 0.5 : z > 47.5
      if (off) out.push(Math.round((side === "w" || side === "e" ? z : x) * 2))
    }
  return out
}

/** A crossing sits this many cells in from the edge, and you come in five further in. */
const EDGE = 3,
  IN = 5

/** Where a side's crossing stands and where you come in by it, at `j` along the side. */
function crossingCells(size: number, side: Side, j: number): { at: Cell; arrive: Cell } {
  const lo = EDGE,
    hi = size - 1 - EDGE + 1
  switch (side) {
    case "w":
      return { at: [lo, j], arrive: [lo + IN, j] }
    case "e":
      return { at: [hi, j], arrive: [hi - IN, j] }
    case "n":
      return { at: [j, lo], arrive: [j, lo + IN] }
    case "s":
      return { at: [j, hi], arrive: [j, hi - IN] }
  }
}

const lands = new Map<string, Set<number>>()
/** The largest stretch of free ground on a map that can all be walked across (cells as j * size + i). */
function mainland(def: MapDefinition): Set<number> {
  const known = lands.get(def.id)
  if (known) return known
  const n = def.size,
    seen = new Uint8Array(n * n)
  let best = new Set<number>()
  for (let k = 0; k < n * n; k++) {
    if (seen[k] || def.rows[Math.floor(k / n)][k % n] !== ".") continue
    const part = new Set<number>([k]),
      todo = [k]
    seen[k] = 1
    while (todo.length) {
      const c = todo.pop()!,
        i = c % n,
        j = Math.floor(c / n)
      for (const entry2 of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const di = entry2[0]
        const dj = entry2[1]

        const ii = i + di,
          jj = j + dj,
          q = jj * n + ii
        if (ii < 0 || jj < 0 || ii >= n || jj >= n || seen[q] || def.rows[jj][ii] !== ".") continue
        seen[q] = 1
        part.add(q)
        todo.push(q)
      }
    }
    if (part.size > best.size) best = part
  }
  lands.set(def.id, best)
  return best
}

/**
 * The ways out of an outdoor map: one for each open side with a map across it, at the same place
 * along the side on both maps — free ground on both, as near the road as it can be.
 */
function crossings(def: MapDefinition, all: Record<string, MapDefinition>): Warp[] {
  const sq = squareOf(def.id)
  if (!sq) return []
  const out: Warp[] = []
  for (const side of ["n", "e", "s", "w"] as Side[]) {
    const o = across(sq, side)
    const there = o?.map ? all[o.map] : undefined
    if (!o || !there) continue
    const back = OPPOSITE[side]
    // where the drawn roads meet this side and the facing side: the crossing goes on the road
    const hints = [...roadEnds(def.id, side), ...roadEnds(there.id, back)]
    const hint = hints.length ? hints.reduce((a, b) => a + b, 0) / hints.length : def.size / 2
    const a = mainland(def),
      b = mainland(there)
    const fits = (j: number) => {
      const here = crossingCells(def.size, side, j),
        far = crossingCells(there.size, back, j)
      return [
        [a, here.at],
        [a, here.arrive],
        [b, far.at],
        [b, far.arrive],
      ].every((entry3) => {
        const land = entry3[0]
        const c = entry3[1]
        return (land as Set<number>).has((c as Cell)[1] * def.size + (c as Cell)[0])
      })
    }
    const js = Array.from({ length: def.size - 2 * (EDGE + IN) }, (_, k) => k + EDGE + IN)
      .filter(fits)
      .sort((a, b) => Math.abs(a - hint) - Math.abs(b - hint) || a - b)
    if (!js.length) continue
    out.push({ at: crossingCells(def.size, side, js[0]).at, to: { map: there.id, at: crossingCells(there.size, back, js[0]).arrive } })
  }
  return out
}

/** Playable outdoor maps (game-system.md §1); new maps stay closed until checked. */
export const OPEN_FIELDS: readonly string[] = ["south-meadow", "forest-edge", "deep-forest", "red-dunes", "sea-cliff", "net-sheds", "quynhon-gate", "mountain-pass", "hue-gate"]

/** The city a map belongs to, as shown before the district: "ファンティエット ― 広場". */
const CITY_NAME: Record<string, string> = { phanthiet: "ファンティエット" }

/** Each building you can enter is a map of its own; its door on the street warps you inside. */
const INDOORS = indoorMaps(INTERIORS, {
  sprites: SPRITES,
  name: (it) => `${CITY_NAME[it.house.map.split("-")[0]] ?? ""} ― ${it.house.name}${it.floor > 0 ? ` ― ${it.floor + 1}階` : ""}`,
  npcs: (it) =>
    it.floor === 0
      ? keepersOf(it).flatMap((name) => {
          const p = keeperPlace(name)
          return p ? [{ name, cell: p.cell }] : []
        })
      : [],
})

/** The street side of every door you can go through. */
function withDoors(def: MapDefinition): MapDefinition {
  const doors = INTERIORS.filter((it) => it.floor === 0 && it.house.map === def.id).map((it) => ({ at: outsideDoor(it.house).door, to: { map: it.id, at: it.arrive } }))
  return { ...def, warps: [...def.warps, ...doors] }
}

const OUTDOORS: Record<string, MapDefinition> = Object.fromEntries([...Object.values(STREETS), ...FIELDS].map((d) => [d.id, d]))
for (const d of Object.values(OUTDOORS)) d.warps = crossings(d, OUTDOORS)
// out in the fields you appear where the way from the town side brings you in
const steps = new Map<string, number>([["phanthiet", 0]])
for (const queue = ["phanthiet"]; queue.length;) {
  const id = queue.shift()!
  for (const w of OUTDOORS[id].warps)
    if (!steps.has(w.to.map)) {
      steps.set(w.to.map, steps.get(id)! + 1)
      queue.push(w.to.map)
    }
}
const fromTown = (id: string) => steps.get(id) ?? 99
for (const d of Object.values(OUTDOORS)) {
  if (d.kind !== "field" || !d.warps.length) continue
  const near = [...d.warps].sort((a, b) => fromTown(a.to.map) - fromTown(b.to.map))[0]
  d.spawn = OUTDOORS[near.to.map].warps.find((x) => x.to.map === d.id)!.to.at
}

export const MAPS: Record<string, MapDefinition> = {
  ...Object.fromEntries(Object.values(OUTDOORS).map((d) => [d.id, d.kind === "town" ? withDoors(d) : d])),
  ...INDOORS,
}
// each map's usual people: those whose work is here (once the places are known)
for (const m of Object.values(MAPS)) {
  m.npcs = RESIDENTS.flatMap((r) => {
    const spot = workSpot(r)
    const cell = spot.map === m.id ? getSpotCell({ spot, places: m.places }) : null
    return cell ? [{ name: r.name, cell }] : []
  })
}

/** How close (in cells) a player must be to an NPC to talk or trade: 3 tiles. */
export const TALK_CELLS = 6
