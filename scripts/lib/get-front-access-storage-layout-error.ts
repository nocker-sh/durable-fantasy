import type { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { z } from "zod"
type Props = Readonly<{ room: SettingDocument; slot: z.infer<typeof personalStorageSchema>[number] }>

/** Replacement grids preserve every unrelated wall, door and bed; the approach remains actual empty floor. */
export function getFrontAccessStorageLayoutError(props: Props): Error | null {
  const source = props.slot.packing?.front_access,
    grid = props.room.grid
  if (!source || !grid || source.grid_rows.length !== grid.rows.length) return new Error("Front-access storage has no matching replacement grid")
  const rect = source.rect,
    use = source.use_space

  for (const y of grid.rows.keys()) {
    const row = source.grid_rows[y]
    if (row.length !== grid.rows[y].length) return new Error("Front-access replacement grid changes room bounds")
    for (const x of Array.from({ length: row.length }).keys()) {
      const inside = x >= rect[0] && x < rect[0] + rect[2] && y >= rect[1] && y < rect[1] + rect[3],
        old = grid.rows[y][x],
        expected = { value: old }
      if (source.replaces_symbols.some((symbol) => symbol === old)) expected.value = "."
      if (inside) {
        if (![".", ...source.replaces_symbols].includes(old)) return new Error("Front-access cabinet replaces another room feature")
        expected.value = "C"
      }
      if (row[x] !== expected.value) return new Error("Front-access replacement grid changes another room feature")
    }
  }
  if (rect[0] + rect[2] > grid.rows[0].length || rect[1] + rect[3] > grid.rows.length || use[0] + use[2] > grid.rows[0].length || use[1] + use[3] > grid.rows.length)
    return new Error("Front-access storage leaves the room grid")
  for (const y of Array.from({ length: use[3] }, (_, index) => use[1] + index))
    for (const x of Array.from({ length: use[2] }, (_, index) => use[0] + index)) if (source.grid_rows[y][x] !== ".") return new Error("Front-access approach is not empty floor")

  return null
}
