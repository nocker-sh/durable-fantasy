import { getSegmentOutsideCircles } from "#/lib/engine/get-segment-outside-circles"
import { FENCE_GAP_RADIUS } from "#/world/town/fence-gap-radius"
import type { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { M } from "#/world/scene/construction/materials"
type Point = readonly [number, number, number]
type Props = Readonly<{ gb: GB; material: (typeof M)[keyof typeof M]; from: Point; to: Point; gaps: ReadonlyArray<readonly [number, number]> }>

/** Retain the existing two timber faces and wear while cutting every rail exactly at an opening, including sloped rails. */
export function drawFenceRail(props: Props): void {
  const from = props.from,
    to = props.to,
    dx = to[0] - from[0],
    dz = to[2] - from[2],
    length = Math.hypot(dx, dz)
  const sections = getSegmentOutsideCircles({ from: [from[0], from[2]], to: [to[0], to[2]], centres: props.gaps, radius: FENCE_GAP_RADIUS })
  if (sections instanceof Error) throw sections
  const ox = (-dz / length) * 0.03,
    oz = (dx / length) * 0.03
  for (const section of sections) {
    const start = section[0],
      end = section[1],
      x = from[0] + dx * start,
      z = from[2] + dz * start,
      y = from[1] + (to[1] - from[1]) * start
    const ex = from[0] + dx * end,
      ez = from[2] + dz * end,
      ey = from[1] + (to[1] - from[1]) * end
    props.gb.quad({ material: props.material, a: [x + ox, y, z + oz], b: [ex + ox, ey, ez + oz], c: [ex + ox, ey + 0.08, ez + oz], d: [x + ox, y + 0.08, z + oz], repeatU: 2, repeatV: 2 })
    props.gb.quad({ material: props.material, a: [ex - ox, ey, ez - oz], b: [x - ox, y, z - oz], c: [x - ox, y + 0.08, z - oz], d: [ex - ox, ey + 0.08, ez - oz], repeatU: 2, repeatV: 2 })
  }
}
