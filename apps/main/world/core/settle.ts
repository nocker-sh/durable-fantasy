import { recoverVital } from "#/world/core/recover-vital"
import type { PlayerState, Rest } from "#/world/core/player-types"

/** 倒れていれば回復しない。変化がない場合は同じ状態を返す。 */
export function settle<P extends Pick<PlayerState, "hp" | "hpAt" | "sp" | "spAt" | "sitting"> & Partial<Pick<PlayerState, "focusAt" | "focusUntil">>>(player: P, rest: Rest, now: number): P {
  if (player.hp <= 0) return player
  const timing = { sitting: player.sitting, focusAt: player.focusAt ?? 0, focusUntil: player.focusUntil ?? 0, now }
  const hp = recoverVital({ ...timing, value: player.hp, at: player.hpAt, maximum: rest.maxHp, perTick: rest.regenHp, focus: false })
  const sp = recoverVital({ ...timing, value: player.sp, at: player.spAt, maximum: rest.maxSp, perTick: rest.regenSp, focus: true })
  if (hp[0] === player.hp && hp[1] === player.hpAt && sp[0] === player.sp && sp[1] === player.spAt) return player

  return { ...player, hp: hp[0], hpAt: hp[1], sp: sp[0], spAt: sp[1] }
}
