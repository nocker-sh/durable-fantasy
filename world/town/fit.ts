// Does each household's home hold its life? (town.md「世帯と建物」) The furniture in each plan,
// at real sizes from farmhouses and town houses of the kind, is laid out floor by floor with room
// to walk, and must fit inside the building's walls as the scene draws them.
//
// Scale: one tile is 1.4 m, so one walk cell (half a tile) is 0.7 m. It follows from the drawn
// buildings: a storey is 1.5 tiles (2.1 m, a low old storey), a door 1.375 tiles (1.9 m).
import { bedsOf, floorsOf, type HouseDef } from "./houses.ts"

export const TILE_M = 1.4
/** the walls' thickness, taken off each side (m) */
const WALL = 0.25
/** the least gap to walk through between rows of furniture (m) */
export const AISLE = 0.6
/** a stair up, on the floor it starts from and the one it reaches (m) */
const STAIR: Piece = { name: "階段", w: 0.9, d: 2.6, front: 0.6 }

/** A piece of furniture: width along the wall, depth out from it, and the clear space it needs in front (m). */
export interface Piece {
  name: string
  w: number
  d: number
  front: number
}

/** Real sizes. Things hung on walls or small enough to stand on another piece take no floor. */
export const SIZES: Readonly<Record<string, Omit<Piece, "name"> | "wall">> = {
  寝台: { w: 0.9, d: 2.0, front: 0.5 },
  "寝台（二人用）": { w: 1.4, d: 2.0, front: 0.5 },
  子どもの寝台: { w: 0.8, d: 1.6, front: 0.4 },
  食卓: { w: 1.2, d: 0.8, front: 0.9 },
  大きな食卓: { w: 2.0, d: 0.9, front: 0.9 },
  地図の卓: { w: 1.2, d: 0.8, front: 0.9 },
  長卓: { w: 2.4, d: 0.8, front: 0.9 },
  卓: { w: 0.9, d: 0.9, front: 0.9 },
  長椅子: { w: 1.8, d: 0.4, front: 0.5 },
  椅子: { w: 0.45, d: 0.45, front: 0.3 },
  暖炉の前の揺り椅子: { w: 0.7, d: 0.9, front: 0.3 },
  衣装箱: { w: 1.0, d: 0.5, front: 0.6 },
  本棚: { w: 1.0, d: 0.35, front: 0.6 },
  保存食の棚: { w: 1.2, d: 0.4, front: 0.6 },
  道具棚: { w: 1.2, d: 0.45, front: 0.6 },
  書類棚: { w: 1.2, d: 0.4, front: 0.6 },
  棚: { w: 1.5, d: 0.5, front: 0.7 },
  薬棚: { w: 1.5, d: 0.4, front: 0.7 },
  商品棚: { w: 2.0, d: 0.45, front: 0.8 },
  弓の並んだ棚: { w: 1.5, d: 0.35, front: 0.6 },
  鍵付きの陳列棚: { w: 1.5, d: 0.5, front: 0.8 },
  売り台: { w: 1.8, d: 0.6, front: 0.9 },
  カウンター: { w: 2.0, d: 0.6, front: 0.9 },
  帳場: { w: 1.2, d: 0.6, front: 0.8 },
  書き物机: { w: 1.0, d: 0.6, front: 0.7 },
  祈祷台: { w: 0.6, d: 0.6, front: 0.7 },
  機織り機: { w: 1.2, d: 1.4, front: 0.6 },
  糸車: { w: 0.6, d: 0.9, front: 0.5 },
  縫い物の台: { w: 1.0, d: 0.6, front: 0.7 },
  調合台: { w: 1.4, d: 0.6, front: 0.8 },
  作業台: { w: 1.8, d: 0.8, front: 0.8 },
  木工台: { w: 2.0, d: 0.8, front: 0.9 },
  なめし桶: { w: 1.0, d: 1.0, front: 0.6 },
  搾り台: { w: 1.2, d: 1.2, front: 0.8 },
  仕込み樽: { w: 1.0, d: 1.0, front: 0.5 },
  酒樽: { w: 0.7, d: 0.7, front: 0.4 },
  樽: { w: 0.6, d: 0.6, front: 0.3 },
  // hung over the fire on its hook, taking no floor of its own
  大鍋: "wall",
  金庫: { w: 0.6, d: 0.6, front: 0.6 },
  天秤: "wall",
  大きな天秤: { w: 1.0, d: 0.8, front: 0.8 },
  素材の箱: { w: 1.2, d: 0.6, front: 0.6 },
  木箱: { w: 0.8, d: 0.6, front: 0.5 },
  粉箱: { w: 1.0, d: 0.6, front: 0.6 },
  野菜籠: { w: 0.6, d: 0.5, front: 0.3 },
  果物籠: { w: 0.6, d: 0.5, front: 0.3 },
  魚桶: { w: 0.6, d: 0.6, front: 0.3 },
  洗濯桶: { w: 0.7, d: 0.7, front: 0.5 },
  水甕: { w: 0.5, d: 0.5, front: 0.3 },
  羊毛の袋: { w: 0.8, d: 0.6, front: 0.3 },
  干し網: "wall",
  吊るした服: "wall",
  吊るした革: "wall",
  吊るした薬草: "wall",
  姿見: "wall",
  盾の壁掛け: "wall",
  鎧掛け: { w: 0.6, d: 0.5, front: 0.6 },
  槍立て: { w: 0.6, d: 0.4, front: 0.4 },
  町の絵地図: "wall",
  斧掛け: "wall",
  杖掛け: "wall",
  鉢植え: "wall",
  乳鉢: "wall",
  鉋と鋸: "wall",
  縄の束: "wall",
  木材: { w: 2.0, d: 0.5, front: 0.4 },
  薪の山: { w: 1.2, d: 0.6, front: 0.3 },
  荷車の車輪: "wall",
  鋤と鍬: "wall",
  干し草: { w: 3.0, d: 2.5, front: 0.6 },
  荷車: { w: 1.4, d: 2.6, front: 0.6 },
  巣箱: { w: 0.6, d: 0.5, front: 0.4 },
  止まり木: { w: 1.2, d: 0.4, front: 0.3 },
  取引の掲示板: "wall",
  // what the households that came later live and work with
  修理台: { w: 1.2, d: 0.6, front: 0.7 },
  ランタンの棚: "wall",
  毛糸の籠: { w: 0.5, d: 0.5, front: 0.3 },
  紙の束: "wall",
  茶の壺: { w: 0.4, d: 0.4, front: 0.3 },
  ろうの鍋: { w: 0.8, d: 0.8, front: 0.6 },
  芯の束: "wall",
  油壺: { w: 0.5, d: 0.5, front: 0.3 },
  ろくろ: { w: 0.9, d: 0.9, front: 0.7 },
  器の棚: { w: 1.4, d: 0.4, front: 0.6 },
  釉の甕: { w: 0.6, d: 0.6, front: 0.4 },
  柳の束: { w: 1.0, d: 0.5, front: 0.3 },
  編みかけの籠: { w: 0.6, d: 0.6, front: 0.3 },
  石鑿と槌: "wall",
  灰汁の桶: { w: 0.7, d: 0.7, front: 0.4 },
  煙突ぶらし: "wall",
  灰の袋: { w: 0.9, d: 0.6, front: 0.3 },
  鋳掛けの道具箱: { w: 0.9, d: 0.5, front: 0.6 },
  // what the shops and rooms came to need, so the rooms read as lived in (scene/construction/furnishings.ts)
  食器棚: { w: 1.2, d: 0.45, front: 0.6 },
  酒の棚: { w: 1.4, d: 0.4, front: 0.6 },
  糸の棚: { w: 1.2, d: 0.4, front: 0.6 },
  革の棚: { w: 1.2, d: 0.45, front: 0.6 },
  腰掛け: { w: 0.35, d: 0.35, front: 0.3 },
  洗面台: { w: 0.6, d: 0.45, front: 0.5 },
  箪笥: { w: 1.0, d: 0.5, front: 0.6 },
  長持: { w: 1.4, d: 0.6, front: 0.6 },
  帽子掛け: { w: 0.45, d: 0.45, front: 0.3 },
  鳥かご: { w: 0.45, d: 0.45, front: 0.3 },
  火鉢: { w: 0.6, d: 0.6, front: 0.5 },
  削り馬: { w: 1.4, d: 0.5, front: 0.6 },
  パン籠: { w: 0.8, d: 0.5, front: 0.5 },
  薪入れ: { w: 0.6, d: 0.4, front: 0.3 },
  薬草の籠: { w: 0.6, d: 0.5, front: 0.3 },
  焼き入れの桶: { w: 0.7, d: 0.7, front: 0.4 },
  砥石: { w: 0.6, d: 0.5, front: 0.6 },
  弓掛け: "wall",
  干した皮: "wall",
  燻しの棚: { w: 1.2, d: 0.5, front: 0.6 },
  石板の束: "wall",
  揺り椅子: { w: 0.7, d: 0.9, front: 0.3 },
  古い槍: "wall",
  地図の束: "wall",
  製図の机: { w: 1.2, d: 0.7, front: 0.8 },
  暖炉: { w: 1.4, d: 0.7, front: 1.0 },
  // the hearth in the middle of the room, the kitchen worktop beside it (floorplan.ts)
  炉: { w: 1.2, d: 1.0, front: 0.7 },
  台所の台: { w: 1.4, d: 0.6, front: 0.8 },
}

/** Every home has a hearth (the town is cold), and a kitchen has a worktop beside it. */
const HEARTH: Piece = { name: "炉", w: 1.4, d: 0.7, front: 1.0 }
const WORKTOP: Piece = { name: "台所の台", w: 1.4, d: 0.6, front: 0.8 }

/** The pieces a furniture entry stands for: 「寝台×2」 is two beds; 「炉（外）」 is outside and takes no floor; 「…（2階）」 stands upstairs. */
export function piecesOf(entry: string): Piece[] | null {
  if (entry.endsWith("（外）")) return []
  entry = entry.replace(/（2階）$/, "")
  const m = /^(.+?)×(\d+)$/.exec(entry)
  const name = m ? m[1] : entry,
    n = m ? Number(m[2]) : 1
  const size = SIZES[name]
  if (size === undefined) return null
  if (size === "wall") return []
  return Array.from({ length: n }, () => ({ name, ...size }))
}

export interface FloorFit {
  floor: number
  w: number
  d: number
  used: number
  fits: boolean
}
export interface Fit {
  id: string
  ok: boolean
  floors: FloorFit[]
  area: number
  people: number
  unknown: string[]
  reason?: string
}

/**
 * Lay pieces in rows across a floor, along the walls and back to back: rows face each other in
 * pairs across one walkway, as wide as the larger of their clear spaces and never under AISLE.
 * Long pieces turn to fit. Returns the depth used.
 */
export function rowsDepth(pieces: Piece[], width: number): number {
  const items = pieces.map((p) => (p.w > width ? { ...p, w: p.d, d: p.w } : p)).sort((a, b) => b.d - a.d)
  const rows: { d: number; front: number }[] = []
  let rowW = 0
  for (const p of items) {
    if (p.w > width) return Infinity
    if (!rows.length || rowW + p.w > width) {
      rows.push({ d: 0, front: 0 })
      rowW = 0
    }
    const r = rows[rows.length - 1]
    rowW += p.w
    r.d = Math.max(r.d, p.d)
    r.front = Math.max(r.front, p.front)
  }
  let depth = 0
  for (let i = 0; i < rows.length; i += 2) {
    const a = rows[i],
      b = rows[i + 1]
    depth += a.d + (b ? b.d : 0) + Math.max(AISLE, a.front, b?.front ?? 0)
  }
  return depth
}

/** The household's members, for the house (homes only; shops' keepers live in them too). */
export function fitHouse(h: HouseDef, people: number): Fit {
  const outerW = (h.x1 - h.x0) * TILE_M,
    outerD = (h.z1 - h.z0) * TILE_M
  const floors = floorsOf(h)
  const unknown: string[] = []
  const byFloor: Piece[][] = Array.from({ length: floors }, () => [])
  // beds go up to the floors their rooms are on; everything else downstairs (or where the plan says)
  const bedFloors = h.plan.rooms.flatMap((r) => Array.from({ length: r.beds ?? 0 }, () => r.floor))
  let bedIndex = 0
  for (const entry of h.plan.furniture) {
    const ps = piecesOf(entry)
    if (!ps) {
      unknown.push(entry)
      continue
    }
    for (const p of ps) {
      if (entry.endsWith("（2階）") && floors > 1) byFloor[1].push(p)
      else if (/寝台/.test(p.name)) byFloor[bedFloors[bedIndex++] ?? 0].push(p)
      else if (/衣装箱|本棚/.test(p.name) && floors > 1) byFloor[1].push(p)
      else if (/酒樽|仕込み樽/.test(p.name) && floors > 1 && h.plan.rooms.some((r) => r.floor === 1 && /蔵|貯蔵/.test(r.name))) byFloor[1].push(p)
      else byFloor[0].push(p)
    }
  }
  if (h.plan.hearth) byFloor[0].push(HEARTH)
  if (h.plan.kitchen) byFloor[0].push(WORKTOP)
  // a household with beds keeps a chest for clothes, and a stair if it lives upstairs
  if (bedsOf(h) && !h.plan.furniture.some((f) => /衣装箱/.test(f))) byFloor[floors > 1 ? 1 : 0].push({ name: "衣装箱", w: 1.0, d: 0.5, front: 0.6 })
  if (floors > 1) for (let f = 0; f < floors; f++) byFloor[f].push(STAIR)
  const fl: FloorFit[] = byFloor.map((ps, f) => {
    const w = outerW - 2 * WALL,
      d = outerD - 2 * WALL
    // rows laid along either wall: how much of the floor's depth they take, the better way round
    const used = Math.min(rowsDepth(ps, w) / d, rowsDepth(ps, d) / w)
    return { floor: f, w, d, used, fits: used <= 1 }
  })
  const ok = !unknown.length && fl.every((f) => f.fits)
  return {
    id: h.id,
    ok,
    floors: fl,
    area: (outerW - 2 * WALL) * (outerD - 2 * WALL) * floors,
    people,
    unknown,
    ...(ok
      ? {}
      : {
          reason: unknown.length
            ? `知らない家具: ${unknown.join("、")}`
            : `入らない階: ${fl
                .filter((f) => !f.fits)
                .map((f) => f.floor + 1)
                .join("、")}`,
        }),
  }
}
