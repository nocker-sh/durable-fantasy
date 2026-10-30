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

/**
 * Spots gathered in groups (landscape.md「ものの寄り方」): `groups` centres, each with up to `per`
 * spots thrown about it within `spread`, thickest at the middle; the ground between stays open.
 */
function clusters(seed: number, groups: number, per: number, spread: number, s0: number, s1: number, ok: (x: number, z: number) => boolean, near?: readonly [number, number][]): Spot[] {
  const r = new Rng(seed)
  const centres = near ? [...near] : scatter(seed + 1, groups, 1, 1, ok).map((c) => [c.x, c.z] as [number, number])
  const out: Spot[] = []
  for (const [cx, cz] of centres) {
    const n = Math.ceil(per * (0.5 + r.next() * 0.5))
    for (let i = 0, got = 0; i < n * 4 && got < n; i++) {
      const a = r.next() * Math.PI * 2,
        d = spread * r.next() ** 1.6
      const x = cx + Math.cos(a) * d,
        z = cz + Math.sin(a) * d
      if (x < 1 || z < 1 || x > N - 1 || z > N - 1 || !ok(x, z)) continue
      // bigger in the middle of a group, smaller at its edge
      const mid = 1 - d / spread
      out.push({ x, z, s: s0 + (s1 - s0) * (0.4 * r.next() + 0.6 * mid), r: r.next() * Math.PI * 2 })
      got++
    }
  }
  return out
}

const dry = (x: number, z: number) => groundH(x, z) > WATER_Y + 0.25

const offRoad = (gap: number) => (x: number, z: number) => roadD(x, z) > gap && trailD(x, z) > 0.55 && dry(x, z) && isFree(x, z)

/** thick at the edges, thinner towards the road */
const edgeward = (depth: number) => (x: number, z: number) => Math.min(x, z, N - x, N - z) < depth + hash2(Math.floor(x * 3), Math.floor(z * 3), 5) * depth

/** The road's verge: the strip a step or two off its edge, where the scythe never reaches. */
const verge = (from: number, to: number) => (x: number, z: number) => {
  const d = roadD(x, z)
  return d > from && d < to && dry(x, z) && isFree(x, z)
}

/** Ground at the water's edge: low and wet, but not under the water. */
const shore = (x: number, z: number) => {
  const h = groundH(x, z)
  return h > WATER_Y - 0.05 && h < WATER_Y + 0.45 && roadD(x, z) > 0.8
}

export { scatter, clusters, offRoad, edgeward, shore, verge }
