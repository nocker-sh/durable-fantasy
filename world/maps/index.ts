// The maps of the world (game-system.md §1). Each map is its own room on the server; this module
// holds what both sides need: name, kind, walk grid, where NPCs stand, warps and spawn points.
// What only the browser needs (terrain, houses, sprites) is loaded per map from `assets`.
import { SHOPS } from "../core/shops.ts";
import { jstMinutes } from "../core/clock.ts";
import { RESIDENTS } from "../town/residents.ts";
import { ROUTINES, spotAt, workSpot, type Spot } from "../town/routines.ts";
import craft from "./phanthiet-craft.json";
import gate from "./phanthiet-gate.json";
import market from "./phanthiet-market.json";
import town from "./phanthiet.json";
import south_meadow from "./south-meadow.json";
import red_dunes from "./red-dunes.json";
import sea_cliff from "./sea-cliff.json";
import net_sheds from "./net-sheds.json";
import forest_edge from "./forest-edge.json";
import deep_forest from "./deep-forest.json";
import quynhon_gate from "./quynhon-gate.json";
import mountain_pass from "./mountain-pass.json";
import hue_gate from "./hue-gate.json";
import { OPPOSITE, across, squareOf, type Side } from "./grid.ts";
import { layoutOf } from "./layouts.ts";
import { INDOOR_SIZE, INTERIORS, interiorRows, keeperPlace, keepersOf, outsideDoor } from "../town/interiors.ts";

export type Cell = readonly [number, number];

export interface Warp {
  /** stand on this cell to warp */
  at: Cell;
  /** map id (see MAPS) and arrival cell */
  to: { map: string; at: Cell };
}

export interface MapDefinition {
  id: string;
  name: string;
  kind: "town" | "indoor" | "field" | "dungeon";
  /** walk grid cells along one side */
  size: number;
  /** rows of '#' (blocked) and '.' (free) */
  rows: readonly string[];
  /** who stands here at some hour of the day, at their usual spot (npcsAt gives who is here now) */
  npcs: readonly { name: string; cell: Cell }[];
  /** named spots (scene `places`, exported with the grid), in cells */
  places: Readonly<Record<string, Cell>>;
  warps: readonly Warp[];
  /** where players appear when they log in here or come back after dying */
  spawn: Cell;
  /** browser-only assets: the scene module and baked resident sprites */
  assets: { sprites: string };
}

type Grid = { size: number; rows: string[]; places?: Record<string, number[]> };
const grid = (g: Grid) => ({ size: g.size, rows: g.rows, npcs: [], places: (g.places ?? {}) as unknown as Record<string, Cell> });
/** Every resident's sprites are baked into one directory, whichever map they live on. */
const SPRITES = "/tmp/sprites";

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
} satisfies Record<string, MapDefinition>;

/** The land outside town: a map to a square of the world grid (grid.ts), joined to its neighbours there. */
const field = (id: string, name: string, g: Grid): MapDefinition => ({
  id,
  name,
  kind: "field",
  ...grid(g),
  warps: [],
  spawn: [48, 48],
  assets: { sprites: SPRITES },
});
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
];

/** Where a map's roads run off one of its sides, along that side, in cells (scene/ground-layouts.ts). */
function roadEnds(id: string, side: Side): number[] {
  const out: number[] = [];
  for (const r of layoutOf(id).roads)
    for (const [x, z] of [r.pts[0], r.pts[r.pts.length - 1]]) {
      const off = side === "w" ? x < 0.5 : side === "e" ? x > 47.5 : side === "n" ? z < 0.5 : z > 47.5;
      if (off) out.push(Math.round((side === "w" || side === "e" ? z : x) * 2));
    }
  return out;
}

/** A crossing sits this many cells in from the edge, and you come in five further in. */
const EDGE = 3,
  IN = 5;

/** Where a side's crossing stands and where you come in by it, at `j` along the side. */
function crossingCells(size: number, side: Side, j: number): { at: Cell; arrive: Cell } {
  const lo = EDGE,
    hi = size - 1 - EDGE + 1;
  switch (side) {
    case "w":
      return { at: [lo, j], arrive: [lo + IN, j] };
    case "e":
      return { at: [hi, j], arrive: [hi - IN, j] };
    case "n":
      return { at: [j, lo], arrive: [j, lo + IN] };
    case "s":
      return { at: [j, hi], arrive: [j, hi - IN] };
  }
}

const lands = new Map<string, Set<number>>();
/** The largest stretch of free ground on a map that can all be walked across (cells as j * size + i). */
function mainland(def: MapDefinition): Set<number> {
  const known = lands.get(def.id);
  if (known) return known;
  const n = def.size,
    seen = new Uint8Array(n * n);
  let best = new Set<number>();
  for (let k = 0; k < n * n; k++) {
    if (seen[k] || def.rows[Math.floor(k / n)][k % n] !== ".") continue;
    const part = new Set<number>([k]),
      todo = [k];
    seen[k] = 1;
    while (todo.length) {
      const c = todo.pop()!,
        i = c % n,
        j = Math.floor(c / n);
      for (const [di, dj] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const ii = i + di,
          jj = j + dj,
          q = jj * n + ii;
        if (ii < 0 || jj < 0 || ii >= n || jj >= n || seen[q] || def.rows[jj][ii] !== ".") continue;
        seen[q] = 1;
        part.add(q);
        todo.push(q);
      }
    }
    if (part.size > best.size) best = part;
  }
  lands.set(def.id, best);
  return best;
}

/**
 * The ways out of an outdoor map: one for each open side with a map across it, at the same place
 * along the side on both maps — free ground on both, as near the road as it can be.
 */
function crossings(def: MapDefinition, all: Record<string, MapDefinition>): Warp[] {
  const sq = squareOf(def.id);
  if (!sq) return [];
  const out: Warp[] = [];
  for (const side of ["n", "e", "s", "w"] as Side[]) {
    const o = across(sq, side);
    const there = o?.map ? all[o.map] : undefined;
    if (!o || !there) continue;
    const back = OPPOSITE[side];
    // where the drawn roads meet this side and the facing side: the crossing goes on the road
    const hints = [...roadEnds(def.id, side), ...roadEnds(there.id, back)];
    const hint = hints.length ? hints.reduce((a, b) => a + b, 0) / hints.length : def.size / 2;
    const a = mainland(def),
      b = mainland(there);
    const fits = (j: number) => {
      const here = crossingCells(def.size, side, j),
        far = crossingCells(there.size, back, j);
      return [
        [a, here.at],
        [a, here.arrive],
        [b, far.at],
        [b, far.arrive],
      ].every(([land, c]) => (land as Set<number>).has((c as Cell)[1] * def.size + (c as Cell)[0]));
    };
    const js = Array.from({ length: def.size - 2 * (EDGE + IN) }, (_, k) => k + EDGE + IN)
      .filter(fits)
      .sort((a, b) => Math.abs(a - hint) - Math.abs(b - hint) || a - b);
    if (!js.length) continue;
    out.push({ at: crossingCells(def.size, side, js[0]).at, to: { map: there.id, at: crossingCells(there.size, back, js[0]).arrive } });
  }
  return out;
}

/**
 * The fields that can be walked into for now: the meadow and the forest round the town
 * (game-system.md §1). The rest are made but closed; their roads are refused (ROAD_CLOSED).
 */
export const OPEN_FIELDS: readonly string[] = ["south-meadow", "forest-edge", "deep-forest"];
/** Can this map be gone into? The town and its buildings always; a field only if it is open. */
export const isOpen = (id: string) => MAPS[id]?.kind !== "field" || OPEN_FIELDS.includes(id);

/** The city a map belongs to, as shown before the district: "ファンティエット ― 広場". */
const CITY_NAME: Record<string, string> = { phanthiet: "ファンティエット" };

/** Each building you can enter is a map of its own; its door on the street warps you inside. */
const INDOORS: Record<string, MapDefinition> = Object.fromEntries(
  INTERIORS.map((it) => {
    const outside = outsideDoor(it.house);
    const keepers = keepersOf(it);
    const def: MapDefinition = {
      id: it.id,
      name: `${CITY_NAME[it.house.map.split("-")[0]] ?? ""} ― ${it.house.name}`,
      kind: "indoor",
      size: INDOOR_SIZE,
      places: {},
      rows: interiorRows(it),
      npcs: keepers.flatMap((name: string) => {
        const p = keeperPlace(name);
        return p ? [{ name, cell: p.cell }] : [];
      }),
      warps: [{ at: it.door, to: { map: it.house.map, at: outside.arrive } }],
      spawn: it.arrive,
      assets: { sprites: SPRITES },
    };
    return [it.id, def];
  }),
);

/** The street side of every door you can go through. */
function withDoors(def: MapDefinition): MapDefinition {
  const doors = INTERIORS.filter((it) => it.house.map === def.id).map((it) => ({ at: outsideDoor(it.house).door, to: { map: it.id, at: it.arrive } }));
  return { ...def, warps: [...def.warps, ...doors] };
}

const OUTDOORS: Record<string, MapDefinition> = Object.fromEntries([...Object.values(STREETS), ...FIELDS].map((d) => [d.id, d as MapDefinition]));
for (const d of Object.values(OUTDOORS)) d.warps = crossings(d, OUTDOORS);
// out in the fields you appear where the way from the town side brings you in
const steps = new Map<string, number>([["phanthiet", 0]]);
for (const queue = ["phanthiet"]; queue.length;) {
  const id = queue.shift()!;
  for (const w of OUTDOORS[id].warps)
    if (!steps.has(w.to.map)) {
      steps.set(w.to.map, steps.get(id)! + 1);
      queue.push(w.to.map);
    }
}
const fromTown = (id: string) => steps.get(id) ?? 99;
for (const d of Object.values(OUTDOORS)) {
  if (d.kind !== "field" || !d.warps.length) continue;
  const near = [...d.warps].sort((a, b) => fromTown(a.to.map) - fromTown(b.to.map))[0];
  d.spawn = OUTDOORS[near.to.map].warps.find((x) => x.to.map === d.id)!.to.at;
}

export const MAPS: Record<string, MapDefinition> = {
  ...Object.fromEntries(Object.values(OUTDOORS).map((d) => [d.id, d.kind === "town" ? withDoors(d) : d])),
  ...INDOORS,
};
// each map's usual people: those whose work is here (once the places are known)
for (const m of Object.values(MAPS)) {
  (m as unknown as { npcs: { name: string; cell: Cell }[] }).npcs = RESIDENTS.flatMap((r) => {
    const spot = workSpot(r);
    const cell = spot.map === m.id ? cellOfSpot(spot) : null;
    return cell ? [{ name: r.name, cell }] : [];
  });
}

export type MapId = string;

export const isMapId = (value: string): value is MapId => Object.hasOwn(MAPS, value);

export function walkable(map: MapDefinition, cell: Cell): boolean {
  const [i, j] = cell;
  return i >= 0 && j >= 0 && i < map.size && j < map.size && map.rows[j][i] === ".";
}

/** The cell a spot stands for, or null when the place is unknown. */
export function cellOfSpot(spot: Spot): Cell | null {
  if ("cell" in spot) return spot.cell;
  if ("tile" in spot) return [Math.floor(spot.tile[0] * 2), Math.floor(spot.tile[1] * 2)];
  return MAPS[spot.map]?.places[spot.place] ?? null;
}

const WORK = new Map(RESIDENTS.map((r) => [r.name, workSpot(r)]));

/** Who is on this map at `min` (minutes past midnight, Japan time), and where. */
export function npcsAt(map: MapDefinition, min: number): { name: string; cell: Cell }[] {
  const out: { name: string; cell: Cell }[] = [];
  for (const r of RESIDENTS) {
    const spot = spotAt(r.name, min, WORK.get(r.name)!);
    const cell = spot && spot.map === map.id ? cellOfSpot(spot) : null;
    if (cell) out.push({ name: r.name, cell });
  }
  return out;
}

/** Where `name` stands on this map at `min`, or null if they are not here then. */
export function npcCell(map: MapDefinition, name: string, min = jstMinutes(Date.now())): Cell | null {
  const spot = spotAt(name, min, WORK.get(name) ?? { map: "", place: "" });
  return spot && spot.map === map.id ? cellOfSpot(spot) : null;
}

/** Is the shop minded at `min`: is one of its keepers at their spot? */
export function shopOpen(shop: keyof typeof SHOPS, min: number): boolean {
  const pitch = (SHOPS[shop] as { at?: { map: string; place: string } }).at;
  return SHOPS[shop].keepers.some((k) => {
    const w = WORK.get(k);
    if (!w) return false;
    // a street seller is open only while standing at the pitch
    if (pitch) {
      const s = spotAt(k, min, w);
      return !!s && "place" in s && s.map === pitch.map && s.place === pitch.place;
    }
    return npcCell(MAPS[w.map], k, min) !== null;
  });
}

/** Minutes until the shop's last keeper goes home, looking up to two hours ahead; null if not that soon. */
export function minutesToClose(shop: keyof typeof SHOPS, min: number): number | null {
  if (!shopOpen(shop, min)) return null;
  for (let d = 5; d <= 120; d += 5) if (!shopOpen(shop, (min + d) % 1440)) return d;
  return null;
}

/** Every spot anyone stands on on this map at some hour, for tests and the dev pages. */
export function spotsOn(map: MapDefinition): { name: string; cell: Cell; doing: string }[] {
  const out: { name: string; cell: Cell; doing: string }[] = [];
  for (const r of RESIDENTS)
    for (const s of ROUTINES[r.name] ?? []) {
      const spot = spotAt(r.name, s.from, WORK.get(r.name)!);
      const cell = spot && spot.map === map.id ? cellOfSpot(spot) : null;
      if (cell && !out.some((o) => o.name === r.name && o.cell[0] === cell[0] && o.cell[1] === cell[1])) out.push({ name: r.name, cell, doing: s.doing });
    }
  return out;
}

export const cellDistance = (a: Cell, b: Cell) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));

/** How close (in cells) a player must be to an NPC to talk or trade: 3 tiles. */
export const TALK_CELLS = 6;

/** Maps one warp away, to load ahead of time. */
export function neighbours(map: MapDefinition): MapId[] {
  return [...new Set(map.warps.map((w) => w.to.map))].filter(isMapId);
}
