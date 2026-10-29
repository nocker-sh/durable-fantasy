// Inside the buildings you can enter (shops and public buildings): each is its own small map.
// The room, where the door is, the counter, the shopkeeper's spot and the furniture all follow
// from the building's definition (houses.ts), with no randomness, so the server's walk grid and
// the scene's room are the same thing worked out twice.
import { SHOPS, type ShopId } from "../core/shops.ts"
import { HOUSEHOLDS, HOUSES, enterable, type HouseDef } from "./houses.ts"
import { floorPlan } from "./floorplan.ts"

export type Cell = readonly [number, number]

/** The world is 48 tiles across; a room sits in the middle of it, the rest is dark. */
export const INDOOR_SIZE = 96
const CENTRE = 24

export type FurnitureKind =
  | "counter"
  | "shelf"
  | "table"
  | "bench"
  | "bed"
  | "chair"
  | "barrel"
  | "crate"
  | "hearth"
  | "rug"
  | "workbench"
  | "rack"
  | "loom"
  | "chest"
  | "stair"
  | "partition"
  | "lowwall"
  | "curtain"
  | "trace"

export interface Furniture {
  kind: FurnitureKind
  /** centre, in tiles */
  x: number
  z: number
  /** size along x and z, in tiles */
  w: number
  d: number
  /** blocks walking */
  solid: boolean
  /** what it is, as the plan names it (floorplan.ts) */
  name?: string
}

export interface Interior {
  floor: number
  house: HouseDef
  /** the indoor map's id */
  id: string
  /** the floor, in tiles */
  x0: number
  z0: number
  x1: number
  z1: number
  /** the door, on the south wall: step on it to leave */
  door: Cell
  /** where you stand after coming in */
  arrive: Cell
  /** where the shopkeeper stands, behind the counter */
  keeper: Cell
  /** Clothes dried along an entrance-room wall, above the walking floor. */
  drying?: { x: number; z0: number; z1: number }
  furniture: readonly Furniture[]
}

/** Which map a building's inside is. */
export const interiorId = (h: HouseDef) => `${h.map.split("-")[0]}-in-${h.id}`

const cellOf = (x: number, z: number): Cell => [Math.floor(x * 2), Math.floor(z * 2)]

/** Metres in the plan to tiles in the room: rooms are drawn half again as large as life, so a walkway is a cell wide. */
export const ROOM_SCALE = 1.5

/** What each piece of the plan is drawn as. */
export function kindOf(name: string): FurnitureKind | null {
  const n = name.replace(/（.+）$/, "")
  if (/^(売り台|カウンター|帳場|鍵付きの陳列棚|大きな天秤)$/.test(n)) return "counter"
  if (n.endsWith("棚")) return "shelf"
  if (/^(食卓|大きな食卓|長卓|卓|地図の卓|書き物机|縫い物の台|祈祷台)$/.test(n)) return "table"
  if (/^長椅子$/.test(n)) return "bench"
  if (/椅子/.test(n)) return "chair"
  if (n.includes("寝台")) return "bed"
  if (/^(樽|酒樽|仕込み樽|水甕|魚桶|洗濯桶|大鍋)$/.test(n)) return "barrel"
  if (/^(木箱|素材の箱|粉箱|野菜籠|果物籠|羊毛の袋|薪の山|木材|荷車|干し草|巣箱)$/.test(n)) return "crate"
  if (/^(炉|暖炉)$/.test(n)) return "hearth"
  if (/^(作業台|木工台|調合台|搾り台|なめし桶|台所の台)$/.test(n)) return "workbench"
  if (/^(鎧掛け|槍立て|止まり木)$/.test(n)) return "rack"
  if (/^(機織り機|糸車)$/.test(n)) return "loom"
  if (/^(衣装箱|金庫|長持|箪笥|洗面台)$/.test(n)) return "chest"
  if (/^(腰掛け)$/.test(n)) return "chair"
  if (/^(帽子掛け|鳥かご)$/.test(n)) return "rack"
  if (/^(火鉢|焼き入れの桶)$/.test(n)) return "barrel"
  if (/^(パン籠|薪入れ|薬草の籠)$/.test(n)) return "crate"
  if (/^(削り馬)$/.test(n)) return "workbench"
  if (n === "階段") return "stair"
  return null
}

const DIVIDER_KIND = { 壁: "partition", 腰壁: "lowwall", カーテン: "curtain", 棚: "shelf" } as const

/** Build one floor for inspection; only INTERIORS registers playable rooms. */
export function interiorPlan(h: HouseDef, floor = 0): Interior {
  const plan = floorPlan(h.id)
  const K = ROOM_SCALE
  const w = plan.W * K,
    d = plan.D * K
  const x0 = CENTRE - w / 2,
    x1 = CENTRE + w / 2,
    z0 = CENTRE - d / 2,
    z1 = CENTRE + d / 2
  const at = (r: { x0: number; z0: number; x1: number; z1: number }) => ({ x: x0 + ((r.x0 + r.x1) / 2) * K, z: z0 + ((r.z0 + r.z1) / 2) * K, w: (r.x1 - r.x0) * K, d: (r.z1 - r.z0) * K })
  const furniture: Furniture[] = []
  for (const p of plan.pieces) {
    if (p.floor !== floor) continue
    const kind = p.on ? "trace" : kindOf(p.name)
    if (!kind) continue
    furniture.push({ kind, ...at(p), solid: p.solid && kind !== "trace", name: p.name })
  }
  for (const dv of plan.dividers) if (dv.floor === floor) furniture.push({ kind: DIVIDER_KIND[dv.kind], ...at(dv), solid: true, name: dv.kind })
  const door = cellOf(x0 + plan.door * K, z1 - 0.25)
  // the keeper stands behind the counter (between it and the back partition), else at the back of the room
  const counter = furniture.find((f) => f.kind === "counter")
  const keeper = counter ? cellOf(counter.x, counter.z - counter.d / 2 - 0.35) : cellOf(CENTRE + 0.25, z0 + 1.0)
  const entrance = plan.rooms.find((room) => room.floor === floor && room.name === "土間")
  const drying =
    floor === 0 && ["fisher", "greengrocer", "fruit"].includes(h.household ?? "") && entrance ? { x: x0 + 0.12, z0: z0 + entrance.z0 * K + 0.2, z1: z0 + entrance.z1 * K - 0.2 } : undefined
  return { drying, house: h, floor, id: interiorId(h), x0, z0, x1, z1, door, arrive: [door[0], door[1] - 2], keeper, furniture }
}

export const INTERIORS: readonly Interior[] = HOUSES.filter(enterable).map((house) => interiorPlan(house))

export const interiorOf = (id: string) => INTERIORS.find((i) => i.id === id)

/** The walk grid of a room: '.' on the floor, '#' for walls, solid furniture and the dark outside. */
export function interiorRows(it: Interior): string[] {
  const rows: string[] = []
  for (let j = 0; j < INDOOR_SIZE; j++) {
    let row = ""
    for (let i = 0; i < INDOOR_SIZE; i++) {
      const x = (i + 0.5) / 2,
        z = (j + 0.5) / 2
      let free = x > it.x0 + 0.2 && x < it.x1 - 0.2 && z > it.z0 + 0.2 && z < it.z1 - 0.2
      if (free) for (const f of it.furniture) if (f.solid && Math.abs(x - f.x) < f.w / 2 + 0.15 && Math.abs(z - f.z) < f.d / 2 + 0.15) free = false
      if (i === it.door[0] && j === it.door[1]) free = true
      row += free ? "." : "#"
    }
    rows.push(row)
  }
  return rows
}

/** The cell just outside a building's door, and one step further out (where you come back to). */
export function outsideDoor(h: HouseDef): { door: Cell; arrive: Cell } {
  const u = h.door.u
  const [x, z, dx, dz] =
    h.door.side === "s" ? [h.x0 + u, h.z1 + 0.55, 0, 1] : h.door.side === "n" ? [h.x1 - u, h.z0 - 0.55, 0, -1] : h.door.side === "e" ? [h.x1 + 0.55, h.z1 - u, 1, 0] : [h.x0 - 0.55, h.z0 + u, -1, 0]
  const door = cellOf(x, z)
  return { door, arrive: [door[0] + dx * 2, door[1] + dz * 2] }
}

/** Who works behind the counter: the shop's keepers, or the household of a public building (the warehouse). */
export function keepersOf(it: Interior): readonly string[] {
  if (it.house.shop) return (SHOPS[it.house.shop as ShopId]?.keepers ?? []).filter((k) => !Object.values(OUT_FRONT).includes(k))
  return HOUSEHOLDS.find((h) => h.id === it.house.household)?.members ?? []
}

/** Shops that also sell out front, through the window or from a board by the door: who stands there. */
export const OUT_FRONT: Record<string, string> = { bakery: "ハンス" }

/**
 * Where a shopkeeper stands: behind the counter of their shop, if it is one you go into (a second
 * keeper one step aside). Null for everyone else, who stand where residents.ts puts them.
 */
export function keeperPlace(name: string): { map: string; cell: Cell } | null {
  if (Object.values(OUT_FRONT).includes(name)) return null
  for (const it of INTERIORS) {
    const keepers = keepersOf(it)
    const k = keepers.indexOf(name)
    if (k >= 0) return { map: it.id, cell: [it.keeper[0] + k * 2, it.keeper[1]] }
  }
  return null
}

/** Where people stand round the tables (at the benches), two to a bench. */
export function seatsOf(it: Interior): Cell[] {
  return it.furniture.filter((f) => f.kind === "bench" || f.kind === "chair").flatMap((f) => (f.kind === "bench" ? [cellOf(f.x - 0.3, f.z), cellOf(f.x + 0.3, f.z)] : [cellOf(f.x, f.z)]))
}
