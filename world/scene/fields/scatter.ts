import { Rng, hash2 } from "../pix"
import { N, WATER_Y, groundH, isFree, roadD, trailD } from "../world"
import type { Spot } from "./instancing.ts"

/** Spots scattered over the map that pass `ok`, with a size between `s0` and `s1`. */
function scatter(seed: number, count: number, s0: number, s1: number, ok: (x: number, z: number) => boolean): Spot[] {
  const r = new Rng(seed)
  const out: Spot[] = []
  for (let i = 0; i < count * 6 && out.length < count; i++) {
    const x = 1 + r.next() * (N - 2),
      z = 1 + r.next() * (N - 2)
    if (!ok(x, z)) continue
    out.push({ x, z, s: s0 + r.next() * (s1 - s0), r: r.next() * Math.PI * 2 })
  }
  return out
}

const dry = (x: number, z: number) => groundH(x, z) > WATER_Y + 0.25

const offRoad = (gap: number) => (x: number, z: number) => roadD(x, z) > gap && trailD(x, z) > 0.55 && dry(x, z) && isFree(x, z)

/** thick at the edges, thinner towards the road */
const edgeward = (depth: number) => (x: number, z: number) => Math.min(x, z, N - x, N - z) < depth + hash2(Math.floor(x * 3), Math.floor(z * 3), 5) * depth

export { scatter, offRoad, edgeward }
