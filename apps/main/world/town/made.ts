import { DAILY_OUTPUT } from "#/world/town/ledger"
import type { Good } from "#/world/town/ledger"

/** What the town makes of a good in a day. */
export function made(g: Good): number {
  return Object.values(DAILY_OUTPUT).reduce((n, o) => n + (o[g] ?? 0), 0)
}
