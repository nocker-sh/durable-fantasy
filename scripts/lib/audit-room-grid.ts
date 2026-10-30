import { auditHearthMaintenance } from "#/scripts/lib/hearth-maintenance"
import { hearthChamber } from "#/world/town/hearth-chamber"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import { rectangleFace } from "#/lib/engine/rectangle-face"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { bedDimensions } from "#/scripts/lib/bed-dimensions"
import { auditFootRest } from "#/scripts/lib/audit-foot-rest"
import { workSurface } from "#/scripts/lib/work-surface"
import { seatDimensions } from "#/scripts/lib/seat-dimensions"
import type { SettingDocument } from "#/scripts/lib/setting-document"

export function auditRoomGrid(document: SettingDocument): string[] {
  if (!document.grid) return []
  const errors: string[] = [],
    rowsSource = document.grid,
    rows = rowsSource.rows,
    cell_m = rowsSource.cell_m
  if (!Number.isFinite(cell_m) || cell_m <= 0 || !Array.isArray(rows) || !rows.length || rows.some((row) => typeof row !== "string")) return ["Invalid grid dimensions"]
  const width = rows[0].length,
    height = rows.length
  if (!width || rows.some((row) => row.length !== width)) return ["Grid rows have different widths"]
  const furniture = document.furniture
  if (!Array.isArray(furniture)) return ["Missing furniture array"]
  const symbols = new Set(["#", ".", "D"]),
    occupied = new Set<string>()
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height
  for (const item of furniture) {
    if (typeof item.symbol !== "string" || item.symbol.length !== 1 || symbols.has(item.symbol)) {
      errors.push("Duplicate or invalid furniture symbol")
      continue
    }
    symbols.add(item.symbol)
    if (![item.name, item.owner, item.source].every((field) => typeof field === "string" && field.length)) errors.push(`${item.symbol}: missing furniture identity`)
    if (!Array.isArray(item.rect) || item.rect.length !== 4 || item.rect.some((n) => !Number.isSafeInteger(n)) || item.rect[2] <= 0 || item.rect[3] <= 0) {
      errors.push(`${item.symbol}: invalid footprint`)
      continue
    }
    const xState = item.rect,
      x = xState[0],
      y = xState[1],
      w = xState[2],
      h = xState[3]
    for (const entry of [
      ["bed", "bed"],
      ["seat", "chair"],
      ["work_surface", "table"],
      ["shelf", "shelf"],
      ["hearth", "hearth"],
    ] as const) {
      const field = entry[0]
      const kind = entry[1]

      if (item[field] !== undefined && item.runtime_kind !== undefined && item.runtime_kind !== kind) errors.push(`${item.symbol}: ${field} needs ${kind} rendering`)
    }
    if (item.runtime_kind === "hearth" || item.hearth_front !== undefined || item.hearth !== undefined) {
      const front = item.hearth_front
      if (front !== "n" && front !== "s" && front !== "w" && front !== "e") errors.push(`${item.symbol}: missing or invalid hearth front`)
      else {
        if (item.runtime_kind !== undefined && item.runtime_kind !== "hearth") errors.push(`${item.symbol}: hearth front needs hearth rendering`)
        try {
          hearthChamber({ bounds: { x0: x * cell_m, z0: y * cell_m, x1: (x + w) * cell_m, z1: (y + h) * cell_m }, front: front, spec: hearthDimensions(item.hearth), bottom: 0 })
        } catch (error) {
          errors.push(`${item.symbol}: ${error instanceof Error ? error.message : String(error)}`)
        }
        const face = rectangleFace({ x: x + w / 2, z: y + h / 2, width: w, depth: h, side: front }),
          nxState = face.outward,
          nx = nxState[0],
          nz = nxState[1]
        if (
          !item.access.some((entry2) => {
            const ax = entry2[0]
            const az = entry2[1]

            const dx = ax + 0.5 - face.point[0],
              dz = az + 0.5 - face.point[1]
            return dx * nx + dz * nz > 0 && Math.abs(-dx * nz + dz * nx) < face.span / 2
          })
        )
          errors.push(`${item.symbol}: hearth front has no use position`)
      }
    }
    const measuredSeat: { value: ReturnType<typeof seatDimensions> | undefined } = { value: undefined }
    if (item.runtime_kind === "chair" || item.seat !== undefined) {
      try {
        measuredSeat.value = seatDimensions(item.seat, w * cell_m, h * cell_m)
      } catch (error) {
        errors.push(`${item.symbol}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    if (item.shelf !== undefined || item.runtime_kind === "shelf") {
      try {
        shelfDimensions(item.shelf, w * cell_m, h * cell_m)
      } catch (error) {
        errors.push(`${item.symbol}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    if (item.bed !== undefined || item.runtime_kind === "bed") {
      try {
        bedDimensions(item.bed, w * cell_m, h * cell_m)
      } catch (error) {
        errors.push(`${item.symbol}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    if (item.runtime_kind === "table" || item.work_surface !== undefined) {
      try {
        workSurface(item.work_surface, w * cell_m, h * cell_m)
      } catch (error) {
        errors.push(`${item.symbol}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    if (measuredSeat.value) for (const error of auditFootRest({ item: item, seat: measuredSeat.value, furniture: furniture, cell: cell_m })) errors.push(`${item.symbol}: ${error}`)
    if (!inside(x, y) || !inside(x + w - 1, y + h - 1)) {
      errors.push(`${item.symbol}: footprint outside room`)
      continue
    }
    for (const j = { value: y }; j.value < y + h; j.value++)
      for (const i = { value: x }; i.value < x + w; i.value++) {
        const key = `${i.value},${j.value}`
        if (occupied.has(key)) errors.push(`${item.symbol}: overlapping footprint`)
        occupied.add(key)
        if (rows[j.value][i.value] !== item.symbol) errors.push(`${item.symbol}: footprint and grid disagree`)
      }
  }
  for (const item of furniture)
    if (item.seat_symbols !== undefined) {
      if (!Array.isArray(item.seat_symbols) || new Set(item.seat_symbols).size !== item.seat_symbols.length) {
        errors.push(`${item.symbol}: invalid seat references`)
        continue
      }
      for (const symbol of item.seat_symbols) {
        const seat = furniture.find((candidate) => candidate.symbol === symbol)
        if (!seat || seat === item || seat.role !== "seat") {
          errors.push(`${item.symbol}: unresolved seat`)
          continue
        }
        if (item.work_surface && seat.seat && item.work_surface.height_m - item.work_surface.thickness_m - seat.seat.height_m < item.work_surface.knee_clearance_m)
          errors.push(`${item.symbol}: insufficient knee clearance above ${symbol}`)
        const axState = item.rect,
          ax = axState[0],
          ay = axState[1],
          aw = axState[2],
          ah = axState[3],
          bxState = seat.rect,
          bx = bxState[0],
          by = bxState[1],
          bw = bxState[2],
          bh = bxState[3]
        if (seat.seat?.facing) {
          const dx = ax + aw / 2 - bx - bw / 2,
            dz = ay + ah / 2 - by - bh / 2,
            facing = seat.seat.facing
          if (
            !(facing === "n" ? dz < 0 && Math.abs(dx) < aw / 2 : facing === "s" ? dz > 0 && Math.abs(dx) < aw / 2 : facing === "w" ? dx < 0 && Math.abs(dz) < ah / 2 : dx > 0 && Math.abs(dz) < ah / 2)
          )
            errors.push(`${item.symbol}: seat ${symbol} faces away from its work surface`)
        }
        const gap = Math.max(ax - (bx + bw - 1), bx - (ax + aw - 1), 0) + Math.max(ay - (by + bh - 1), by - (ay + ah - 1), 0)
        if (gap !== 1) errors.push(`${item.symbol}: seat is not beside its work surface`)
      }
    }
  const doors: [number, number][] = []
  for (const y = { value: 0 }; y.value < height; y.value++)
    for (const x = { value: 0 }; x.value < width; x.value++) {
      const symbol = rows[y.value][x.value]
      if (!symbols.has(symbol)) errors.push(`Unknown grid symbol ${symbol}`)
      if (symbol !== "#" && symbol !== "." && symbol !== "D" && !occupied.has(`${x.value},${y.value}`)) errors.push(`Furniture outside its footprint at ${x.value},${y.value}`)
      if (symbol === "D") doors.push([x.value, y.value])
    }
  const entries = [...doors]
  for (const connection of (Array.isArray(document.connections) ? document.connections : []) as { kind?: string; furniture?: string; access?: number[] }[]) {
    if (connection.kind !== "stair") continue
    const point = connection.access
    const stair = furniture.find((item) => item.symbol === connection.furniture)
    if (point?.length === 2 && point.every(Number.isSafeInteger) && stair?.access.some((p) => p[0] === point[0] && p[1] === point[1]) && rows[point[1]]?.[point[0]] === ".")
      entries.push([point[0], point[1]])
    else errors.push("Stair entry has no matching reachable use position")
  }
  if (!entries.length) return [...errors, "Room has no doorway or stair entry"]
  const visited = new Set<string>(),
    queue = [entries[0]]
  for (const index = { value: 0 }; index.value < queue.length; index.value++) {
    const xState2 = queue[index.value],
      x = xState2[0],
      y = xState2[1],
      key = `${x},${y}`
    if (visited.has(key)) continue
    visited.add(key)
    for (const entry3 of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      const nx = entry3[0]
      const ny = entry3[1]
      if (inside(nx, ny) && [".", "D"].includes(rows[ny][nx]) && !visited.has(`${nx},${ny}`)) queue.push([nx, ny])
    }
  }
  for (const entry4 of entries) {
    const x = entry4[0]
    const y = entry4[1]
    if (!visited.has(`${x},${y}`)) errors.push(`Unreachable doorway at ${x},${y}`)
  }
  for (const item of furniture) {
    if (!Array.isArray(item.access) || !item.access.length) {
      errors.push(`${item.symbol}: no use position`)
      continue
    }
    for (const point of item.access) {
      if (!Array.isArray(point) || point.length !== 2 || point.some((n) => !Number.isSafeInteger(n))) {
        errors.push(`${item.symbol}: invalid use position`)
        continue
      }
      const xState3 = point,
        x = xState3[0],
        y = xState3[1]
      if (!inside(x, y) || !visited.has(`${x},${y}`)) errors.push(`${item.symbol}: unreachable use position`)
      if (Array.isArray(item.rect) && item.rect.length === 4) {
        const fxState = item.rect,
          fx = fxState[0],
          fy = fxState[1],
          w = fxState[2],
          h = fxState[3]
        const distance = Math.max(fx - x, 0, x - (fx + w - 1)) + Math.max(fy - y, 0, y - (fy + h - 1))
        if (distance !== 1) errors.push(`${item.symbol}: use position is not beside furniture`)
      }
    }
  }
  return [...errors, ...auditHearthMaintenance(document)]
}
