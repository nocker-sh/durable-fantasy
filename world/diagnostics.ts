import { LoadTimer } from "#/lib/engine/laps"
import type { Lap } from "#/lib/engine/laps"

export const diagnosticTimer = new LoadTimer()
export const diagnosticGlobal: typeof globalThis & { __laps?: Lap[][]; __scene?: unknown } = globalThis
