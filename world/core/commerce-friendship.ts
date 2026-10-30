import type { PlayerState } from "#/world/core/player-types"
import { FRIEND } from "#/world/core/friendship-rules"
import { befriend } from "#/world/core/befriend"
import { dayOf } from "#/world/core/day-of"

/** Doing business with someone: a little more friendship, once a day each (the day is kept in boughtOn). */
export function dealtWith(state: Pick<PlayerState, "friends" | "boughtOn">, names: readonly string[], now: number) {
  const today = dayOf(now)
  return names.reduce(
    (commerce, name) => {
      if (commerce.boughtOn[name] === today) return commerce

      return { friends: befriend(commerce.friends, name, FRIEND.bought), boughtOn: { ...commerce.boughtOn, [name]: today } }
    },
    { friends: state.friends, boughtOn: state.boughtOn },
  )
}
