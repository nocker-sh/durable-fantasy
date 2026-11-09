import { accept } from "#/world/core/accept"
import { dealtWith } from "#/world/core/commerce-friendship"
import { reject } from "#/world/core/reject"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"
import { PEOPLE } from "#/world/town/people"

/**
 * Talking to a resident the room has checked we stand beside: the same little friendship as a day's
 * business with them, once a day each, so every resident can come to know us (economy.md §6).
 */
export function greet(state: PlayerState, to: string, now: number): Transition {
  if (!Object.hasOwn(PEOPLE, to)) return reject("TOO_FAR")
  const known = dealtWith(state, [to], now)
  if (known.boughtOn === state.boughtOn) return accept(state)
  return accept({ ...state, friends: known.friends, boughtOn: known.boughtOn })
}
