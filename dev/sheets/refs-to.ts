import type { Ref } from "#/dev/sheets/schema"
import { SHEETS } from "#/dev/sheets/registry"

const cache: { value: Map<string, Ref[]> | null } = { value: null }

/** Rows that point at this one, with what this one is to them. */
export function refsTo(sheetId: string, id: string): Ref[] {
  if (!cache.value) {
    cache.value = new Map()
    for (const s of SHEETS)
      for (const r of s.rows())
        for (const x of s.refs?.(r) ?? []) {
          const k = `${x.sheet}/${x.id}`
          cache.value.set(k, [...(cache.value.get(k) ?? []), { sheet: s.id, id: s.key(r), as: x.as }])
        }
  }
  return cache.value.get(`${sheetId}/${id}`) ?? []
}
