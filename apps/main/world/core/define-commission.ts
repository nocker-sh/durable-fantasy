import type { Commission } from "#/world/core/commission-types"
import type { ItemId } from "#/world/core/items/catalog"
type Props = Readonly<{ id: string; craftsman: string; output: readonly [ItemId, number]; inputs: readonly (readonly [ItemId, number])[]; fee: number; minutes: number }>

/** Definition tuples become separate material records; authored order and quantities stay unchanged. */
export function defineCommission(props: Props): Commission {
  return {
    id: props.id,
    craftsman: props.craftsman,
    output: { item: props.output[0], count: props.output[1] },
    inputs: props.inputs.map((input) => ({ item: input[0], count: input[1] })),
    fee: props.fee,
    minutes: props.minutes,
  }
}
