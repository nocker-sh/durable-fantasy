import type { GameSession } from "#/world/client/game-session"

/** 受付前の術は次の振りにも添え、通信の揺れによる早過ぎる攻撃の無視で予約を失わない。 */
export function sendFightSwing(session: Pick<GameSession, "art" | "fighting" | "socket" | "state">, monster: string): void {
  const at = performance.now()
  const queued = session.art
  const ready = queued ? session.state.get().player?.ready[queued.skill] ?? 0 : 0
  const art = queued && queued.monster === monster && at - queued.at <= 4000 && ready <= Date.now() ? queued.skill : null
  if (!art) session.art = null
  session.fighting = { monster, at }
  session.socket?.send({ type: "attack", monster, ...(art ? { art } : {}) })
}
