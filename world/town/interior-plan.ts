import { scaleRoomPieceDimensions } from "#/world/town/scale-room-piece-dimensions"
import { getInteriorPiece } from "#/world/town/get-interior-piece"
import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import type { HouseDef } from "#/world/town/house-types"
import { floorPlan } from "#/world/town/floorplan/floor-plan"
import type { Cell, Furniture, UnrenderedFurniture, Interior } from "#/world/town/interiors"
import { ROOM_SCALE } from "#/world/town/interior-rules"
import { interiorId } from "#/world/town/interior-id"
import { interiorCellOf } from "#/world/town/interior-cell-of"

const CENTRE = 24
const DIVIDER_KIND = { 壁: "partition", 腰壁: "lowwall", カーテン: "curtain", 棚: "shelf" } as const

/** Build one floor for inspection; only INTERIORS registers playable rooms. */
export function interiorPlan(h: HouseDef, floor = 0, plan = floorPlan(h.id)): Interior {
  if (!Number.isSafeInteger(floor) || floor < 0 || floor >= plan.floors) throw new RangeError(`Invalid floor ${floor} for building ${h.id}`)
  const K = ROOM_SCALE
  const w = plan.W * K,
    d = plan.D * K
  const x0 = CENTRE - w / 2,
    x1 = CENTRE + w / 2,
    z0 = CENTRE - d / 2,
    z1 = CENTRE + d / 2
  const at = (r: { x0: number; z0: number; x1: number; z1: number }) => ({ x: x0 + ((r.x0 + r.x1) / 2) * K, z: z0 + ((r.z0 + r.z1) / 2) * K, w: (r.x1 - r.x0) * K, d: (r.z1 - r.z0) * K })
  const furniture: Furniture[] = [],
    unrenderedFurniture: UnrenderedFurniture[] = []
  for (const p of plan.pieces) {
    if (p.floor !== floor) continue
    const piece = getInteriorPiece({ piece: scaleRoomPieceDimensions(p, K), placement: at(p) })
    if ("kind" in piece) furniture.push(piece)
    else unrenderedFurniture.push(piece)
  }
  for (const dv of plan.dividers) if (dv.floor === floor) furniture.push({ kind: DIVIDER_KIND[dv.kind], ...at(dv), solid: true, name: dv.kind })
  const entranceGeometry = plan.entrance ? { point: [x0 + plan.entrance.point[0] * K, z0 + plan.entrance.point[1] * K] as const, outward: plan.entrance.outward } : undefined
  const doorCoordinate = (axis: 0 | 1) => {
    const doorGeometry = entranceGeometry!,
      point = doorGeometry.point,
      outward = doorGeometry.outward,
      normal = outward[axis],
      at = point[axis] * 2 - 0.5
    // Choose the closest cell centre strictly inside the wall, including half-cell boundaries.
    return normal > 0 ? Math.ceil(at) - 1 : normal < 0 ? Math.floor(at) + 1 : Math.floor(point[axis] * 2)
  }
  const door: Cell = entranceGeometry ? [doorCoordinate(0), doorCoordinate(1)] : interiorCellOf(x0 + plan.door * K, z1 - 0.25)
  const outward = entranceGeometry?.outward ?? [0, 1]
  // the keeper stands behind the counter (between it and the back partition), else at the back of the room
  const counter = furniture.find((f) => f.kind === "counter")
  const keeper = counter ? interiorCellOf(counter.x, counter.z - counter.d / 2 - 0.35) : interiorCellOf(CENTRE + 0.25, z0 + 1.0)
  const entrance = plan.rooms.find((room) => room.floor === floor && room.name === "土間")
  const drying =
    floor === 0 && ["fisher", "greengrocer", "fruit"].includes(h.household ?? "") && entrance ? { x: x0 + 0.12, z0: z0 + entrance.z0 * K + 0.2, z1: z0 + entrance.z1 * K - 0.2 } : undefined
  const projectRect = (r: { x0: number; z0: number; x1: number; z1: number }) => ({ x0: x0 + r.x0 * K, z0: z0 + r.z0 * K, x1: x0 + r.x1 * K, z1: z0 + r.z1 * K })
  const stairSections = plan.stairSections
    ?.filter((s) => s.lowerFloor === floor || s.upperFloor === floor)
    .map((s) => ({
      ...s,
      ...projectRect(s),
      height: s.height * K,
      slabThickness: s.slabThickness * K,
      going: s.going * K,
      landing: s.landing * K,
      clearWidth: s.clearWidth * K,
      railInset: s.railInset * K,
      openingLength: s.openingLength * K,
    }))
  const floorOpenings = stairSections?.filter((s) => s.upperFloor === floor).map((s) => stairGeometry(s).opening)
  const stairBlocks = stairSections?.map((s) => (s.upperFloor === floor ? stairGeometry(s).opening : stairGeometry(s).flight))
  const level = plan.floorLevels?.find((level) => level.floor === floor)
  const below = plan.floorLevels?.find((level) => level.floor === floor - 1)
  const windows = plan.windows
    ?.filter((w) => w.floor === floor)
    .map((w) => {
      const point: readonly [number, number] = w.side === "n" ? [x0 + w.along * K, z0] : w.side === "s" ? [x0 + w.along * K, z1] : w.side === "w" ? [x0, z0 + w.along * K] : [x1, z0 + w.along * K]
      const outward: readonly [number, number] = w.side === "n" ? [0, -1] : w.side === "s" ? [0, 1] : w.side === "w" ? [-1, 0] : [1, 0]
      return { id: w.id, point, outward, width: w.width * K, sill: w.sill * K, height: w.height * K, frame: w.frame * K, depth: plan.cellSize! * K }
    })
  const lamps = plan.lamps
    ?.filter((l) => l.floor === floor)
    .map((l) => ({ ...l, x: x0 + l.x * K, z: z0 + l.z * K, bottom: l.bottom * K, top: l.top * K, diameter: l.diameter * K, ceiling: l.ceiling * K }))
  return {
    windows,
    lamps,
    flues: plan.flues?.map((s) => ({
      ...s,
      wallThickness: s.wallThickness * K,
      floorCollar: s.floorCollar * K,
      floorSupport: { depth: s.floorSupport.depth * K, steps: s.floorSupport.steps },
      ...projectRect(s),
    })),
    below: plan.authored && level && below ? { drop: (level.elevation - below.elevation) * K, interior: interiorPlan(h, floor - 1, plan) } : undefined,
    doorHeight: plan.doorHeight ? plan.doorHeight * K : undefined,
    shellInset: plan.cellSize ? plan.cellSize * K : undefined,
    doorWidth: plan.doorWidth ? plan.doorWidth * K : undefined,
    entrance: entranceGeometry,
    floorThickness: level ? level.thickness * K : undefined,
    wallHeight: level ? (level.ceiling - level.elevation) * K : undefined,
    stairSections,
    floorOpenings,
    stairBlocks,
    authored: plan.authored,
    drying,
    house: h,
    floor,
    id: interiorId(h, floor),
    x0,
    z0,
    x1,
    z1,
    door,
    arrive: [door[0] - outward[0] * 2, door[1] - outward[1] * 2],
    keeper,
    furniture,
    unrenderedFurniture,
  }
}
