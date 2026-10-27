import type { PlayerState } from "./player.ts"
import { FRIEND, befriend, dayOf } from "./errands.ts"

/** Doing business with someone: a little more friendship, once a day each (the day is kept in boughtOn). */
export function dealtWith(state: Pick<PlayerState, "friends" | "boughtOn">, names: readonly string[], now: number) {
  const today = dayOf(now)
  let friends = state.friends,
    boughtOn = state.boughtOn
  for (const k of names)
    if (boughtOn[k] !== today) {
      friends = befriend(friends, k, FRIEND.bought)
      boughtOn = { ...boughtOn, [k]: today }
    }
  return { friends, boughtOn }
}
