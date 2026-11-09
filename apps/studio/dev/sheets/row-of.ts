import { sheetOf } from "#/dev/sheets/sheet-of"
const index = new Map<string, Map<string, unknown>>()

/** A row by its sheet and ID. */
export function rowOf(sheetId: string, id: string): unknown {
  const m = { value: index.get(sheetId) }
  if (!m.value) {
    const s = sheetOf(sheetId)
    m.value = new Map(s ? s.rows().map((r) => [s.key(r), r]) : [])
    index.set(sheetId, m.value)
  }
  return m.value.get(id)
}
