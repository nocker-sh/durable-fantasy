import { roomHasWorker } from "./room-worker"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type HotWork = { process?: keyof typeof PROCESS_ROLES; handler: string; heat_sources: string[]; cooling: string[]; finished: string[]; fuel: string[] }
const PROCESS_ROLES = {
  forge: ["forge_fire", "hot_cooling"],
  wax: ["wax_heater", "wax_cooling"],
  smoking: ["smoking_heat", "smoked_food_cooling"],
  metal_repair: ["repair_heat", "repair_cooling"],
} as const
const HEATED_ROLES = new Set<string>(Object.values(PROCESS_ROLES).flat())
/** Distinguish industrial heat, hot workpieces, cold goods and fuel; not a clearance certification. */
export function auditHotWork(documents: ReadonlyMap<string, SettingDocument>): string[] {
  const errors: string[] = []
  for (const room of documents.values()) {
    const plan = room.hot_work as HotWork | undefined
    if (!plan) {
      if (room.furniture?.some((f) => HEATED_ROLES.has(f.role ?? ""))) errors.push(`${room.id}: Industrial heat furniture has no hot-work plan`)
      continue
    }
    const fail = (problem: string) => errors.push(`${room.id}: ${problem}`)
    if (room.kind !== "rooms" || !room.grid) {
      fail("Hot work has no room grid")
      continue
    }
    if (!roomHasWorker(room, plan.handler, documents)) fail("Hot-work handler has no matching work assignment")
    const used = new Set<string>(),
      heatRoleState = PROCESS_ROLES[plan.process ?? "forge"],
      heatRole = heatRoleState[0],
      coolingRole = heatRoleState[1]
    for (const entry of [
      [plan.heat_sources, heatRole],
      [plan.cooling, coolingRole],
      [plan.finished, "finished_storage"],
      [plan.fuel, "fuel_storage"],
    ] as const) {
      const symbols = entry[0]
      const role = entry[1]

      if (!symbols.length) fail(`Hot work has no ${role} assignment`)
      for (const symbol of symbols) {
        if (used.has(symbol)) fail("Hot-work zones reuse the same furniture")
        used.add(symbol)
        if (room.furniture?.find((f) => f.symbol === symbol)?.role !== role) fail(`Hot work has no matching ${role} furniture`)
      }
    }
  }
  return errors
}
