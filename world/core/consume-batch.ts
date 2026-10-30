import type { Quality } from "#/world/core/items/kinds"

type Props = Readonly<{ quantities: [number, number, number, number]; count: number }>

/** Residents buy ordinary goods first, then the remaining qualities, within the owned shelf copy. */
export function consumeBatch(props: Props): void {
  const remaining = { count: props.count }
  const qualities: readonly Quality[] = [1, 0, 2, 3]

  for (const quality of qualities) {
    const consumed = Math.min(remaining.count, props.quantities[quality])
    props.quantities[quality] -= consumed
    remaining.count -= consumed
  }
}
