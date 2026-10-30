import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { storageRetrieval } from "#/world/town/storage-retrieval"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { MIN_PASSAGE_WIDTH_M, MAX_HAND_REACH_M } from "#/scripts/lib/spatial-rules"
import { EPS } from "#/scripts/lib/storage-retrieval"
import { overlaps } from "#/scripts/lib/storage-retrieval/overlaps"

/** Translation and retreat are linear, so relative segment distance certifies the full motion. */
export function auditStorageRetrieval(room: SettingDocument, building?: SettingDocument): string[] {
  if (!room.grid) return []
  const errors: string[] = [],
    k = room.grid.cell_m
  const level = (building?.floor_levels as { floor: number; elevation_m: number; ceiling_elevation_m: number }[] | undefined)?.find((l) => l.floor === room.floor)
  const ceiling = level ? level.ceiling_elevation_m - level.elevation_m : undefined
  const obstacles: { owner?: string; rect: readonly [number, number, number, number] }[] = []
  room.grid.rows.forEach((row, z) =>
    [...row].forEach((tile, x) => {
      if (tile === "#") obstacles.push({ rect: [x * k, z * k, (x + 1) * k, (z + 1) * k] })
    }),
  )
  for (const f of room.furniture ?? []) obstacles.push({ owner: f.symbol, rect: [f.rect[0] * k, f.rect[1] * k, (f.rect[0] + f.rect[2]) * k, (f.rect[1] + f.rect[3]) * k] })
  for (const f of room.furniture ?? []) {
    if (f.shelf === undefined) continue
    try {
      const xState = f.rect.map((n) => n * k),
        x = xState[0],
        z = xState[1],
        w = xState[2],
        d = xState[3],
        shelf = shelfDimensions(f.shelf, w, d),
        parts = shelfItemParts({ x: x + w / 2, z: z + d / 2, width: w, depth: d, floor: 0, shelf: shelf })
      for (const entry of (shelf.items ?? []).entries()) {
        const i = entry[0]
        const item = entry[1]

        const fail = (message: string) => errors.push(`${f.symbol}/${item.id}: ${message}`)
        if (item.kind === "box" && room.design_gate === "通過" && item.lidLift === undefined) fail("stored box lid movement is not designed")
        const r = item.retrieval
        if (!r) {
          if (room.design_gate === "通過") fail("stored object has no retrieval design")
          continue
        }
        if (r.bodyRadius * 2 < MIN_PASSAGE_WIDTH_M - EPS) fail("retrieval body is smaller than the design width")
        const motion = storageRetrieval({ x: x + w / 2, z: z + d / 2, width: w, depth: d, shelf: shelf, index: i })
        if (item.kind === "box" && item.lidLift !== undefined) {
          if (ceiling === undefined || !Number.isFinite(ceiling) || ceiling <= 0) {
            if (room.design_gate === "通過") fail("stored box lid has no checked ceiling")
          } else if (motion.to.y1 + item.lidLift > ceiling + EPS) fail("stored box lid reaches its ceiling")
        }
        const space = f.use_space?.[r.space]?.rect.map((n) => n * k)
        if (!space) {
          fail("retrieval has no operating space")
          continue
        }
        const sxState = space,
          sx = sxState[0],
          sz = sxState[1],
          sw = sxState[2],
          sd = sxState[3],
          area = [sx, sz, sx + sw, sz + sd]
        for (const p of [motion.bodyStart, motion.bodyEnd])
          if (p[0] - r.bodyRadius < area[0] - EPS || p[0] + r.bodyRadius > area[2] + EPS || p[1] - r.bodyRadius < area[1] - EPS || p[1] + r.bodyRadius > area[3] + EPS)
            fail("retrieval body leaves its operating space")
        if (motion.to.x0 < area[0] - EPS || motion.to.x1 > area[2] + EPS || motion.to.z0 < area[1] - EPS || motion.to.z1 > area[3] + EPS) fail("withdrawn object leaves its operating space")
        if (
          segmentRectDistance([motion.from.x0, motion.from.z0, motion.from.x1, motion.from.z1], motion.bodyStart, [motion.bodyEnd[0] - motion.delta[0], motion.bodyEnd[1] - motion.delta[1]]) <
          r.bodyRadius - EPS
        )
          fail("retrieval body intersects the moving object")
        for (const entry2 of [
          [motion.bodyStart, motion.gripsStart],
          [motion.bodyEnd, motion.gripsEnd],
        ] as const) {
          const body = entry2[0]
          const grips = entry2[1]
          for (const grip of grips) if (Math.hypot(body[0] - grip[0], body[1] - grip[1]) > MAX_HAND_REACH_M + EPS) fail("retrieval grip is out of reach")
        }
        for (const obstacle of obstacles) {
          if (segmentRectDistance(obstacle.rect, motion.bodyStart, motion.bodyEnd) < r.bodyRadius - EPS) fail("retrieval body crosses a wall or furniture")
          if (obstacle.owner !== f.symbol && overlaps(motion.swept, obstacle.rect)) fail("retrieval object crosses a wall or furniture")
        }
        for (const entry3 of parts.entries()) {
          const j = entry3[0]
          const other = entry3[1]
          if (i !== j && motion.from.y0 < other.y1 - EPS && motion.from.y1 > other.y0 + EPS && overlaps(motion.swept, [other.x0, other.z0, other.x1, other.z1]))
            fail("retrieval crosses another stored object")
        }
      }
    } catch (error) {
      errors.push(`${f.symbol}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return [...new Set(errors)]
}
