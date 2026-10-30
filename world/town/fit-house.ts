import { bedsOf } from "#/world/town/beds-of"
import { floorsOf } from "#/world/town/floors-of"
import type { HouseDef } from "#/world/town/house-types"
import { TILE_M } from "#/world/town/fit"
import type { Piece, FloorFit, Fit } from "#/world/town/fit"
import { piecesOf } from "#/world/town/pieces-of"
import { rowsDepth } from "#/world/town/rows-depth"

const WALL = 0.25
const STAIR: Piece = { name: "階段", w: 0.9, d: 2.6, front: 0.6 }
const HEARTH: Piece = { name: "炉", w: 1.4, d: 0.7, front: 1.0 }
const WORKTOP: Piece = { name: "台所の台", w: 1.4, d: 0.6, front: 0.8 }

/** The household's members, for the house (homes only; shops' keepers live in them too). */
export function fitHouse(h: HouseDef, people: number): Fit {
  const outerW = (h.x1 - h.x0) * TILE_M,
    outerD = (h.z1 - h.z0) * TILE_M
  const floors = floorsOf(h)
  const unknown: string[] = []
  const byFloor: Piece[][] = Array.from({ length: floors }, () => [])
  // beds go up to the floors their rooms are on; everything else downstairs (or where the plan says)
  const bedFloors = h.plan.rooms.flatMap((r) => Array.from({ length: r.beds ?? 0 }, () => r.floor))
  const bedIndex = { value: 0 }
  for (const entry of h.plan.furniture) {
    const ps = piecesOf(entry)
    if (!ps) {
      unknown.push(entry)
      continue
    }
    for (const p of ps) {
      if (entry.endsWith("（2階）") && floors > 1) byFloor[1].push(p)
      else if (/寝台/.test(p.name)) byFloor[bedFloors[bedIndex.value++] ?? 0].push(p)
      else if (/衣装箱|本棚/.test(p.name) && floors > 1) byFloor[1].push(p)
      else if (/酒樽|仕込み樽/.test(p.name) && floors > 1 && h.plan.rooms.some((r) => r.floor === 1 && /蔵|貯蔵/.test(r.name))) byFloor[1].push(p)
      else byFloor[0].push(p)
    }
  }
  if (h.plan.hearth) byFloor[0].push(HEARTH)
  if (h.plan.kitchen) byFloor[0].push(WORKTOP)
  // a household with beds keeps a chest for clothes, and a stair if it lives upstairs
  if (bedsOf(h) && !h.plan.furniture.some((f) => /衣装箱/.test(f))) byFloor[floors > 1 ? 1 : 0].push({ name: "衣装箱", w: 1.0, d: 0.5, front: 0.6 })
  if (floors > 1) for (const pieces of byFloor) pieces.push(STAIR)
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
