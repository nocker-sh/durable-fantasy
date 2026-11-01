import { COUNTER_MAX } from "#/world/core/monsters"
import type { Fight } from "#/world/core/wild/types"

type Props = Readonly<{ fight: Fight | null; now: number; interval: number }>

/**
 * How many of a creature's blows have fallen due since they were last counted, and when the next is due.
 * A new fight (or one saved before blows were timed) strikes back at once. Only a few blows are counted
 * at a time, since the room cannot tell whether the player stood within reach between their own strikes.
 */
export function countersDue(props: Props): { counters: number; next: number } {
  const due = props.fight?.next ?? props.now
  if (props.now < due) return { counters: 0, next: due }
  const fallen = Math.floor((props.now - due) / props.interval) + 1

  return { counters: Math.min(COUNTER_MAX, fallen), next: due + fallen * props.interval }
}
