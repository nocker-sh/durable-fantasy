import type { PlayerRecord } from "#/world/server/player-record"

export function advanceCombatLife(record: Pick<PlayerRecord, "combatLife">): void {
  const next = record.combatLife + 1
  if (!Number.isSafeInteger(next)) throw new Error("Combat lives exhausted")
  record.combatLife = next
}
