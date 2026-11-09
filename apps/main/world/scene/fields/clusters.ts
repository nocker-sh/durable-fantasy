import type { Spot } from "#/world/scene/fields/instancing"
import { Rng } from "#/lib/engine/random"
import { scatter } from "#/world/scene/fields/helpers/scatter/scatter"
import { N } from "#/world/maps/ground/rules"
type Props = Readonly<{
  seed: number
  /** how many groups to scatter, when `near` does not place them */
  groups: number
  per: number
  spread: number
  s0: number
  s1: number
  ok: (x: number, z: number) => boolean
  near?: readonly [number, number][]
}>

/** Groups of things clumped around centres, bigger in the middle of a group. */
export function clusters(props: Props): Spot[] {
  const seed = props.seed,
    groups = props.groups,
    per = props.per,
    spread = props.spread,
    s0 = props.s0,
    s1 = props.s1,
    ok = props.ok,
    near = props.near
  const r = new Rng(seed)
  const centres = near
    ? [...near]
    : scatter({
        seed: seed + 1,
        count: groups,
        s0: 1,
        s1: 1,
        ok: ok,
      }).map((c) => [c.x, c.z] as [number, number])
  const out: Spot[] = []
  for (const centre of centres) {
    const cx = centre[0],
      cz = centre[1]
    const n = Math.ceil(per * (0.5 + r.next() * 0.5))
    for (let i = 0, got = 0; i < n * 4 && got < n; i++) {
      const a = r.next() * Math.PI * 2,
        d = spread * r.next() ** 1.6
      const x = cx + Math.cos(a) * d,
        z = cz + Math.sin(a) * d
      if (x < 1 || z < 1 || x > N - 1 || z > N - 1 || !ok(x, z)) continue
      // bigger in the middle of a group, smaller at its edge
      const mid = 1 - d / spread
      out.push({
        x,
        z,
        s: s0 + (s1 - s0) * (0.4 * r.next() + 0.6 * mid),
        r: r.next() * Math.PI * 2,
      })
      got++
    }
  }
  return out
}
