import type { Sheet, Ref } from "./schema.ts"
import { items, itemArt } from "./items.tsx"
import { npcs, households, houses, relations, ledger } from "./people.tsx"
import { maps, world } from "./maps.tsx"
import { shops, batches, makers } from "./shops.tsx"
import { recipes, stations, commissions, errands, nodes } from "./crafting.tsx"
import { monsters, skills, life } from "./combat.tsx"
import { objects } from "./objects.tsx"
import { uiIcons, textures, ramps, parts, presets, motions, anims } from "./art.tsx"
import { lines, events, messages, flavor, lettering } from "./dialogue.tsx"
import { screens } from "./screens.tsx"

export const SHEETS: Sheet[] = [
  items,
  npcs,
  households,
  houses,
  ledger,
  maps,
  shops,
  batches,
  makers,
  recipes,
  stations,
  commissions,
  errands,
  monsters,
  nodes,
  skills,
  life,
  objects,
  world,
  uiIcons,
  itemArt,
  textures,
  ramps,
  parts,
  presets,
  motions,
  anims,
  lines,
  relations,
  events,
  messages,
  screens,
  flavor,
  lettering,
]

export const sheetOf = (id: string) => SHEETS.find((s) => s.id === id)

const index = new Map<string, Map<string, unknown>>()

/** A row by its sheet and ID. */
export function rowOf(sheetId: string, id: string): unknown {
  let m = index.get(sheetId)
  if (!m) {
    const s = sheetOf(sheetId)
    m = new Map(s ? s.rows().map((r) => [s.key(r), r]) : [])
    index.set(sheetId, m)
  }
  return m.get(id)
}

let back: Map<string, Ref[]> | null = null

/** Rows that point at this one, with what this one is to them. */
export function refsTo(sheetId: string, id: string): Ref[] {
  if (!back) {
    back = new Map()
    for (const s of SHEETS)
      for (const r of s.rows())
        for (const x of s.refs?.(r) ?? []) {
          const k = `${x.sheet}/${x.id}`
          back.set(k, [...(back.get(k) ?? []), { sheet: s.id, id: s.key(r), as: x.as }])
        }
  }
  return back.get(`${sheetId}/${id}`) ?? []
}
