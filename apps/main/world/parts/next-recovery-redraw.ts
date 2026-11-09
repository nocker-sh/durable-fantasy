import { REGEN_MS } from "#/world/core/player-rules"
import type { PlayerState, Rest } from "#/world/core/player-types"

/**
 * How long until HP or SP next comes back (settle counts from hpAt / spAt in REGEN_MS steps), so the status frame
 * redraws as a tick lands rather than up to a quarter tick later; never longer than a quarter tick.
 */
export function nextRecoveryRedraw(settled: Pick<PlayerState, "hp" | "hpAt" | "sp" | "spAt">, rest: Pick<Rest, "maxHp" | "maxSp">, now: number): number {
  const ticks = [settled.hp < rest.maxHp ? settled.hpAt : null, settled.sp < rest.maxSp ? settled.spAt : null].filter((tick): tick is number => !!tick)
  const nextTick = ticks.length ? Math.min(...ticks) + REGEN_MS - now : REGEN_MS / 4
  return Math.min(REGEN_MS / 4, Math.max(50, nextTick + 30))
}
