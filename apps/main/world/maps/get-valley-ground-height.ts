import { fbm } from "#/lib/engine/fbm"
import { smooth } from "#/lib/engine/smooth"
import { Polyline } from "#/lib/engine/polyline"
import { VALLEY_POOL, VALLEY_STREAM } from "#/world/maps/valley-stream"
import type { Layout } from "#/world/maps/layout-types"
type Props = Parameters<NonNullable<Layout["shape"]>>[0]

const stream = new Polyline([...VALLEY_STREAM])

/** Two rock steps across the valley, high in the north-west, the pool at the foot in the south-east; the stream cuts its bed. */
export function getValleyGroundHeight(input: Props): number {
  const x = input.x,
    z = input.z
  const wobble = (fbm({ x, y: z, scale: 0.18, seed: 61 }) - 0.5) * 3
  // the steps run across the stream's fall line: measured along the north-west to south-east diagonal
  const along = (x + z) * 0.7071 + wobble
  // rocky slopes, too steep to climb but not sheer, except where the water goes over: a clean drop
  const sd = stream.distance(x, z)
  const sheer = smooth(2.6, 1, sd)
  const wu = 3.2 - sheer * 2.4,
    wl = 3 - sheer * 2.2
  const upper = smooth(28.5 + wu / 2, 28.5 - wu / 2, along) * 1.9
  const lower = smooth(44.5 + wl / 2, 44.5 - wl / 2, along) * 1.6
  const bed = smooth(1.4, 0.3, sd) * 0.35
  const pd = Math.hypot(x - VALLEY_POOL[0], z - VALLEY_POOL[1]) + wobble * 0.5
  const pool = smooth(VALLEY_POOL[2], VALLEY_POOL[2] * 0.3, pd)
  const h = input.h + upper + lower - bed
  return h + (-1.9 - h) * pool
}
