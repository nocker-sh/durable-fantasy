import type { PaceKind } from "#/world/core/pace-rules"
import type { PlayerRecord } from "#/world/server/player-record"

type Input = Readonly<{ kind: PaceKind; gap: number }>

/** 前に通した時刻から `gap` 経っていれば今を記録して通す。断った試みは記録せず、待てば通る。 */
export function pacePlayer(record: Pick<PlayerRecord, "paces">, input: Input, now: number): boolean {
  const last = record.paces?.[input.kind] ?? 0
  if (now - last < input.gap) return false
  record.paces = { ...record.paces, [input.kind]: now }
  return true
}
