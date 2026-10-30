import { Rng } from "#/lib/engine/random"
import { N } from "#/world/scene/world"
import type { Spot } from "#/world/scene/fields/instancing"

/** Spots scattered over the map that pass `ok`, with a size between `s0` and `s1`. */
type Props = {
  seed: number
  count: number
  s0: number
  s1: number
  ok: (x: number, z: number) => boolean
}

export function scatter(props: Props): Spot[] {
  const r = new Rng(props.seed)
  const out: Spot[] = []
  for (const i = { value: 0 }; i.value < props.count * 6 && out.length < props.count; i.value++) {
    const x = 1 + r.next() * (N - 2),
      z = 1 + r.next() * (N - 2)
    if (!props.ok(x, z)) continue
    out.push({ x, z, s: props.s0 + r.next() * (props.s1 - props.s0), r: r.next() * Math.PI * 2 })
  }
  return out
}
