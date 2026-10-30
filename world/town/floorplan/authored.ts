import type { WindowFixture, LampFixture, ActivitySpot } from "#/world/town/room-fixtures"
import type { BuildingEnvelope } from "#/world/town/building-envelope"
import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import type { StairSection } from "#/world/town/floorplan/stair-geometry"
import type { FurnitureKind } from "#/world/town/furniture-kinds"
import type { FloorPlan, PRoom, Divider, Placed, Use, FlueSection } from "#/world/town/floorplan/types"
import { assertAuthoredFloorLevels } from "#/world/town/floorplan/assert-authored-floor-levels"

export type AuthoredRoom = {
  id: string
  name: string
  use: Use
  floor: number
  origin: readonly [number, number]
  rows: readonly string[]
  furniture: readonly {
    symbol: string
    name: string
    kind: FurnitureKind
    cookingTop?: Placed["cookingTop"]
    hearth?: Placed["hearth"]
    hearthFront?: Placed["hearthFront"]
    shelf?: Placed["shelf"]
    bed?: Placed["bed"]
    seat?: Placed["seat"]
    workSurface?: Placed["workSurface"]
    wallMount?: Placed["wallMount"]
    solid: boolean
    rect: readonly [number, number, number, number]
  }[]
}

export type AuthoredPlan = {
  id: string
  exterior?: BuildingEnvelope
  cellM: number
  width: number
  depth: number
  floors: number
  /** Centre of the opening cells, in building grid coordinates. */
  entry: readonly [number, number]
  entrySide: "n" | "s" | "w" | "e"
  entryWidth: number
  entryHeight: number
  rooms: readonly AuthoredRoom[]
  windows: readonly WindowFixture[]
  lamps: readonly LampFixture[]
  activitySpots: readonly ActivitySpot[]
  details: readonly Placed[]
  flues: readonly FlueSection[]
  stairSections: readonly StairSection[]
  floorLevels: readonly { floor: number; elevation: number; ceiling: number; thickness: number }[]
}

/** Project authored cells once into metres; rendering and collision consume the same result. */
export function authoredFloorPlan(source: AuthoredPlan): FloorPlan {
  const dimensions = source,
    cellM = dimensions.cellM,
    width = dimensions.width,
    depth = dimensions.depth,
    floors = dimensions.floors
  if (!Number.isFinite(cellM) || cellM <= 0 || ![width, depth, floors].every((n) => Number.isSafeInteger(n) && n > 0)) throw new Error("Invalid authored plan dimensions")
  if (!Number.isFinite(source.entryHeight) || source.entryHeight <= 0) throw new Error("Invalid authored entrance height")
  if (!Number.isSafeInteger(source.entryWidth) || source.entryWidth <= 0) throw new Error("Invalid authored entrance width")
  const horizontal = source.entrySide === "n" || source.entrySide === "s",
    along = source.entry[horizontal ? 0 : 1],
    edge = source.entry[horizontal ? 1 : 0]
  const expected = source.entrySide === "n" || source.entrySide === "w" ? 0 : (horizontal ? depth : width) - 1
  const start = along - (source.entryWidth - 1) / 2,
    end = start + source.entryWidth
  if (
    !["n", "s", "w", "e"].includes(source.entrySide) ||
    !source.entry.every(Number.isFinite) ||
    edge !== expected ||
    !Number.isSafeInteger(start) ||
    start < 1 ||
    end > (horizontal ? width : depth) - 1
  )
    throw new Error("Authored entrance must fit one exterior wall")
  assertAuthoredFloorLevels(source.floorLevels, floors)
  const rooms: PRoom[] = [],
    pieces: Placed[] = [],
    dividers: Divider[] = []
  const walls = new Set<string>(),
    covered = new Map<string, { tile: string; boundary: boolean }>()
  const extent = (inputProps: { x: number; z: number; w: number; d: number }) => {
    const x = inputProps.x
    const z = inputProps.z
    const w = inputProps.w
    const d = inputProps.d
    return { x0: x * cellM, z0: z * cellM, x1: (x + w) * cellM, z1: (z + d) * cellM }
  }
  const roomIds = new Set<string>()
  for (const room of source.rooms) {
    const origin = room.origin,
      ox = origin[0],
      oz = origin[1],
      rw = room.rows[0]?.length ?? 0,
      rd = room.rows.length
    if (roomIds.has(room.id)) throw new Error(`Duplicate authored room: ${room.id}`)
    roomIds.add(room.id)
    if (
      !Number.isSafeInteger(room.floor) ||
      room.floor < 0 ||
      room.floor >= floors ||
      ![ox, oz].every((n) => Number.isSafeInteger(n) && n >= 0) ||
      !rw ||
      !rd ||
      room.rows.some((row) => row.length !== rw) ||
      ox + rw > width ||
      oz + rd > depth
    )
      throw new Error(`Invalid authored room: ${room.id}`)
    for (let z = 0; z < rd; z++)
      for (let x = 0; x < rw; x++) {
        const key = `${room.floor}:${ox + x}:${oz + z}`
        const tile = room.rows[z][x],
          boundary = x === 0 || z === 0 || x === rw - 1 || z === rd - 1,
          previous = covered.get(key)
        // Adjacent documents may share the same boundary wall and its opening.
        if (previous && !(boundary && previous.boundary && tile === previous.tile && (tile === "#" || tile === "D"))) throw new Error(`Overlapping authored rooms: ${room.id}`)
        covered.set(key, { tile, boundary })
      }
    rooms.push({ name: room.name, use: room.use, floor: room.floor, ...extent({ x: ox, z: oz, w: rw, d: rd }) })
    for (let z = 0; z < rd; z++)
      for (let x = 0; x < rw; x++)
        if (room.rows[z][x] === "#") {
          const gx = ox + x,
            gz = oz + z
          // The exterior shell is drawn separately; never duplicate shared partition cells.
          if (gx > 0 && gx < width - 1 && gz > 0 && gz < depth - 1) walls.add(`${room.floor}:${gx}:${gz}`)
        }
    for (const piece of room.furniture) {
      const rectangle = piece.rect,
        x = rectangle[0],
        z = rectangle[1],
        w = rectangle[2],
        d = rectangle[3]
      if (![x, z, w, d].every(Number.isSafeInteger) || x < 0 || z < 0 || w <= 0 || d <= 0 || x + w > rw || z + d > rd) throw new Error(`Invalid authored furniture: ${room.id}/${piece.name}`)
      pieces.push({
        cookingTop: piece.cookingTop,
        hearth: piece.hearth,
        hearthFront: piece.hearthFront,
        shelf: piece.shelf,
        bed: piece.bed,
        workSurface: piece.workSurface,
        seat: piece.seat,
        wallMount: piece.wallMount,
        label: piece.symbol,
        name: piece.name,
        kind: piece.kind,
        solid: piece.solid,
        wall: false,
        floor: room.floor,
        ...extent({ x: ox + x, z: oz + z, w: w, d: d }),
      })
    }
  }
  pieces.push(...source.details)
  if (covered.size !== width * depth * floors) throw new Error("Authored plan leaves uncovered floor cells")
  for (let k = start; k < end; k++) {
    const x = horizontal ? k : edge,
      z = horizontal ? edge : k
    if (covered.get(`0:${x}:${z}`)?.tile !== "D") throw new Error("Authored entrance disagrees with doorway cells")
  }
  // Merge horizontal runs to keep geometry small without filling any doorway.
  for (let floor = 0; floor < floors; floor++)
    for (let z = 1; z < depth - 1; z++)
      for (let x = 1; x < width - 1;) {
        if (!walls.has(`${floor}:${x}:${z}`)) {
          x++
          continue
        }
        const start = x++
        while (x < width - 1 && walls.has(`${floor}:${x}:${z}`)) x++
        dividers.push({ floor, kind: "壁", ...extent({ x: start, z: z, w: x - start, d: 1 }) })
      }
  for (const section of source.stairSections) stairGeometry(section)
  return {
    id: source.id,
    authored: true,
    windows: source.windows,
    lamps: source.lamps,
    flues: source.flues,
    cellSize: cellM,
    doorWidth: source.entryWidth * cellM,
    doorHeight: source.entryHeight,
    stairSections: source.stairSections,
    floorLevels: source.floorLevels,
    W: width * cellM,
    D: depth * cellM,
    floors,
    entrance: {
      point: horizontal ? [(along + 0.5) * cellM, source.entrySide === "n" ? 0 : depth * cellM] : [source.entrySide === "w" ? 0 : width * cellM, (along + 0.5) * cellM],
      outward: source.entrySide === "n" ? [0, -1] : source.entrySide === "s" ? [0, 1] : source.entrySide === "w" ? [-1, 0] : [1, 0],
    },
    door: (source.entry[0] + 0.5) * cellM,
    rooms,
    pieces,
    dividers,
    unplaced: [],
    unrepresentedRooms: [],
  }
}
