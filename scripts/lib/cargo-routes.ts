import { rectangleTranslationBounds } from "#/lib/engine/rectangle-translation-bounds"
import { rectangleTranslationHits } from "#/lib/engine/rectangle-translation-hits"
import { rectangleTurnRadius } from "#/lib/engine/rectangle-turn-radius"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"
import { doorPanelRect } from "#/scripts/lib/door-panel-rect"
import { roomDoorSwings } from "#/scripts/lib/room-door-swings"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import { getCargoDoorFrames } from "#/scripts/lib/get-cargo-door-frames"
type CargoRoute = { activity: string; length_m: number; width_m: number; clearance_m: number; points_m: number[][] }
type Rect = [number, number, number, number]
const EPS = 1e-9
/** The envelope includes the load and carrier. Turns reserve its complete circumscribed circle. */
export function auditCargoRoutes(document: SettingDocument): string[] {
  const routes = (document.cargo_routes ?? []) as CargoRoute[]
  if (!routes.length) return []
  if (!document.grid) return ["Cargo route has no room grid"]
  const rowsSource = document.grid,
    rows = rowsSource.rows,
    scale = rowsSource.cell_m,
    errors: string[] = [],
    obstacles: { name: string; rect: Rect }[] = []
  const frames = getCargoDoorFrames(document)
  if (frames instanceof Error) return [frames.message]
  for (const frame of frames) obstacles.push({ name: "door frame", rect: [...frame] })
  for (let y = 0; y < rows.length; y++)
    for (let x = 0; x < rows[y].length; x++) if (![".", "D"].includes(rows[y][x])) obstacles.push({ name: rows[y][x], rect: [x * scale, y * scale, (x + 1) * scale, (y + 1) * scale] })
  const leaves = (document.door_leaves ?? []) as Parameters<typeof roomDoorSwings>[1][]
  for (const connection of (document.connections ?? []) as { kind?: string; door?: number[] }[])
    if ((connection.kind ?? "door") === "door" && connection.door && !leaves.some((leaf) => leaf.door[0] === connection.door![0] && leaf.door[1] === connection.door![1]))
      errors.push("Cargo route has an undesigned door leaf")
  for (const leaf of leaves) {
    if (leaf.thickness_m === undefined) {
      errors.push("Cargo route needs the open door's thickness")
      continue
    }
    for (const swing of roomDoorSwings(document, leaf)) {
      const xState = doorPanelRect(swing, true),
        x = xState[0],
        y = xState[1],
        w = xState[2],
        h = xState[3]
      obstacles.push({ name: "open door", rect: [x, y, x + w, y + h] })
    }
  }
  const room: Rect = [0, 0, rows[0].length * scale, rows.length * scale]
  for (const entry of routes.entries()) {
    const index = entry[0]
    const route = entry[1]

    const label = `Cargo route ${index + 1}`
    if (Math.min(route.length_m, route.width_m) < MIN_PASSAGE_WIDTH_M) errors.push(`${label}: envelope omits the carrier's design width`)
    const length = route.length_m + 2 * route.clearance_m,
      width = route.width_m + 2 * route.clearance_m
    const directions: string[] = []
    for (let i = 1; i < route.points_m.length; i++) {
      const a = route.points_m[i - 1],
        b = route.points_m[i],
        dx = b[0] - a[0],
        dy = b[1] - a[1]
      if (Math.abs(dx) < EPS === Math.abs(dy) < EPS) {
        errors.push(`${label}: use nonzero axis-aligned segments`)
        directions.push("invalid")
        continue
      }
      const horizontal = Math.abs(dy) < EPS,
        halfX = (horizontal ? length : width) / 2,
        halfY = (horizontal ? width : length) / 2
      const relative = [-halfX, -halfY, halfX, halfY] as const
      const swept = rectangleTranslationBounds(relative, a, b)
      directions.push(horizontal ? "x" : "y")
      if (swept[0] < room[0] - EPS || swept[1] < room[1] - EPS || swept[2] > room[2] + EPS || swept[3] > room[3] + EPS) errors.push(`${label}: envelope leaves the room drawing`)
      for (const obstacle of obstacles)
        if (rectangleTranslationHits({ relative: relative, from: a, to: b, obstacle: obstacle.rect, tolerance: EPS, boundary: "open" })) errors.push(`${label}: sweep hits ${obstacle.name}`)
    }
    for (let i = 1; i < directions.length; i++)
      if (directions[i] !== "invalid" && directions[i - 1] !== "invalid" && directions[i] !== directions[i - 1]) {
        const xState2 = route.points_m[i],
          x = xState2[0],
          y = xState2[1],
          radius = rectangleTurnRadius([-length / 2, -width / 2, length / 2, width / 2])
        if (x - radius < -EPS || y - radius < -EPS || x + radius > room[2] + EPS || y + radius > room[3] + EPS) errors.push(`${label}: turn leaves the room drawing`)
        for (const obstacle of obstacles) if (pointRectDistance(x, y, obstacle.rect) < radius - EPS) errors.push(`${label}: turn hits ${obstacle.name}`)
      }
  }
  return [...new Set(errors)]
}
