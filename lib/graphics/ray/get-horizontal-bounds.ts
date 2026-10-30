import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
type Props = { primitives: readonly Primitive[]; position: readonly [number, number]; heading: number; scale: number }

/** Rotate the complete conservative native bounds, rather than only their centres or two opposite corners. */
export function getHorizontalBounds(props: Props): readonly [number, number, number, number] | Error {
  if (!props.primitives.length || ![...props.position, props.heading, props.scale].every(Number.isFinite) || props.scale <= 0) return new Error("Invalid horizontal primitive transform")
  const result: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity],
    cosine = Math.cos(props.heading),
    sine = Math.sin(props.heading)
  for (const primitive of props.primitives) {
    const bounds = primitiveBounds(primitive)
    if (![...bounds.min, ...bounds.max].every(Number.isFinite) || bounds.min.some((value, axis) => value > bounds.max[axis])) return new Error("Invalid horizontal primitive bounds")
    for (const x of [bounds.min[0], bounds.max[0]])
      for (const z of [bounds.min[2], bounds.max[2]]) {
        const px = props.position[0] + (x * cosine + z * sine) * props.scale,
          pz = props.position[1] + (-x * sine + z * cosine) * props.scale
        if (![px, pz].every(Number.isFinite)) return new Error("Unbounded horizontal primitive transform")
        result[0] = Math.min(result[0], px)
        result[1] = Math.min(result[1], pz)
        result[2] = Math.max(result[2], px)
        result[3] = Math.max(result[3], pz)
      }
  }

  return result
}
