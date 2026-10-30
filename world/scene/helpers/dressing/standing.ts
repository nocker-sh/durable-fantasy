import type { V2 } from "#/world/scene/construction/registry"

const standingOn = new Map<string, V2[]>()

import { ROUTINES } from "#/world/town/routines"
import { RESIDENTS } from "#/world/town/residents"

export function standing(map: string): V2[] {
  const known = standingOn.get(map)
  if (known) return known
  const out: V2[] = []
  for (const r of RESIDENTS) if ((r.map ?? "phanthiet") === map && typeof r.at !== "string") out.push([r.at[0], r.at[1]])
  for (const day of Object.values(ROUTINES))
    for (const s of day) {
      if (typeof s.where !== "object" || s.where.map !== map) continue
      if ("tile" in s.where) out.push([s.where.tile[0], s.where.tile[1]])
      else if ("cell" in s.where) out.push([(s.where.cell[0] + 0.5) / 2, (s.where.cell[1] + 0.5) / 2])
    }
  standingOn.set(map, out)
  return out
}
