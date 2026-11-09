import type { Quality } from "#/world/core/items/kinds"

type Props = Readonly<{ weights: readonly [number, number, number, number]; draw: number }>

/** Subtract weights in quality order, assigning the remaining upper interval to the last quality. */
export function batchQuality(props: Props): Quality {
  const draw = { remaining: props.draw }
  const qualities: readonly Quality[] = [0, 1, 2]

  for (const quality of qualities) {
    if (!(draw.remaining >= props.weights[quality])) return quality
    draw.remaining -= props.weights[quality]
  }

  return 3
}
