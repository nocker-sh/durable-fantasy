import { addItem } from "#/world/core/add-item"
import { overWeight } from "#/world/core/over-weight"
import type { Bag, Stack } from "#/world/core/bag-types"
import type { ItemId } from "#/world/core/items/catalog"
import type { PlayerState } from "#/world/core/player-types"
import type { Reason } from "#/world/core/commands"

type Outcome = Readonly<{ item: ItemId; count: number; mark?: Partial<Pick<Stack, "q" | "by">> }>
type Props = Readonly<{ state: PlayerState; bag: Bag; equipment?: PlayerState["equipment"]; outcomes: readonly Outcome[] }>

/**
 * Whether every result a roll could give would fit, checked before the roll counts. A refusal that
 * depended on the result would let a full bag throw away the results a player does not want for free.
 */
export function fitsEveryOutcome(props: Props): Reason | null {
  for (const outcome of props.outcomes) {
    const bag = addItem({ bag: props.bag, item: outcome.item, count: outcome.count, mark: outcome.mark })
    if (!bag) return "BAG_FULL"
    if (overWeight(props.state, { ...props.state, bag, equipment: props.equipment ?? props.state.equipment })) return "TOO_HEAVY"
  }
  return null
}
