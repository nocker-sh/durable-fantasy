// Food, drinks and medicine share recovery, fullness and timed-effect rules.
import { takeFromSlot } from "#/world/core/take-from-slot"
import { ITEMS } from "#/world/core/items/catalog"
import { effectOf } from "#/world/core/effect-of"
import { MAX_STAMINA } from "#/world/core/player-rules"
import { fullNow } from "#/world/core/full-now"
import type { PlayerState } from "#/world/core/player-types"
import { derive } from "#/world/core/derive"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"

export function consume(state: PlayerState, index: number, now: number): Transition {
  const slot = state.bag[index]
  if (!slot) return reject("EMPTY_SLOT")
  const item = slot.item
  if (!ITEMS[item].use) return reject("NOT_USABLE")
  const effect = effectOf(item, slot.q ?? 1, slot.by)
  const stats = derive(state)
  const full = fullNow(state, now)
  if (effect.full > 0 && full + effect.full > 100) return reject("TOO_FULL")
  const wantsHp = effect.hp > 0 && state.hp < stats.maxHp,
    wantsSp = effect.sp > 0 && state.sp < stats.maxSp
  const wantsStamina = effect.stamina > 0 && state.stamina < MAX_STAMINA
  const food = effect.full > 0 || effect.warm > 0 || effect.focus > 0
  const extendsWarmth = effect.warm > 0 && now + effect.warm * 60_000 > state.warmUntil
  const extendsFocus = effect.focus > 0 && now + effect.focus * 60_000 > state.focusUntil
  if (!wantsHp && !wantsSp && !wantsStamina && !extendsWarmth && !extendsFocus) return reject(food ? "NOTHING_TO_GAIN" : effect.sp && !effect.hp ? "SP_FULL" : "HP_FULL")
  const bag = takeFromSlot(state.bag, index, 1)
  if (!bag) return reject("NOT_OWNED")
  const hp = Math.min(stats.maxHp, state.hp + effect.hp)
  const sp = Math.min(stats.maxSp, state.sp + effect.sp)
  const stamina = Math.min(MAX_STAMINA, state.stamina + effect.stamina)
  const warmUntil = effect.warm > 0 ? Math.max(state.warmUntil, now + effect.warm * 60_000) : state.warmUntil
  const focusUntil = effect.focus > 0 ? Math.max(state.focusUntil, now + effect.focus * 60_000) : state.focusUntil
  const focusAt = effect.focus > 0 && state.focusUntil <= now ? now : state.focusAt
  return accept(
    { ...state, hp, sp, stamina, focusAt, focusUntil, full: effect.full > 0 ? full + effect.full : state.full, fullAt: effect.full > 0 ? now : state.fullAt, warmUntil, bag },
    {
      type: "used",
      item,
      hp: hp - state.hp,
      sp: sp - state.sp,
      stamina: stamina - state.stamina,
      warm: effect.warm,
      ...(effect.focus > 0 ? { focus: effect.focus } : {}),
      ...(slot.by ? { by: slot.by } : {}),
    },
  )
}
