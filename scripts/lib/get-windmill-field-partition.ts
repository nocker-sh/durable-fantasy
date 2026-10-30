import { subtractRectangles } from "#/lib/engine/rectangle-subtraction"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
type Props = Readonly<{ field: Rectangle; bounds: readonly [number, number, number, number]; metresPerTile: number; additionalBounds?: readonly (readonly [number, number, number, number])[] }>

/** Account for the exact field portion lost to the yard while retaining every other piece of productive land. */
export function getWindmillFieldPartition(props: Props) {
  const field = props.field,
    bounds = props.bounds,
    scale = props.metresPerTile
  if (
    ![field.x0, field.x1, field.z0, field.z1, ...bounds, scale].every(Number.isFinite) ||
    field.x0 >= field.x1 ||
    field.z0 >= field.z1 ||
    bounds[0] >= bounds[2] ||
    bounds[1] >= bounds[3] ||
    scale <= 0
  )
    return new Error("Invalid mill field partition")
  const used = { x0: Math.max(field.x0, bounds[0]), z0: Math.max(field.z0, bounds[1]), x1: Math.min(field.x1, bounds[2]), z1: Math.min(field.z1, bounds[3]) }
  if (used.x0 >= used.x1 || used.z0 >= used.z1) return new Error("Mill yard does not replace its nominated field")
  const cuts = [used, ...(props.additionalBounds ?? []).map((rect) => ({ x0: rect[0], z0: rect[1], x1: rect[2], z1: rect[3] }))]
  if (cuts.some((rect) => !Object.values(rect).every(Number.isFinite) || rect.x0 >= rect.x1 || rect.z0 >= rect.z1)) return new Error("Invalid mill field cuts")
  const retained = subtractRectangles(field, cuts)
  if (!retained.length) return new Error("Mill yard consumes the whole nominated field")
  const area = (rect: Rectangle) => (rect.x1 - rect.x0) * (rect.z1 - rect.z0) * scale * scale
  const originalM2 = area(field),
    retainedM2 = retained.reduce((sum, rect) => sum + area(rect), 0),
    removedM2 = originalM2 - retainedM2
  if (![originalM2, removedM2, retainedM2].every(Number.isFinite)) return new Error("Unbounded mill field areas")
  return { used, retained, originalM2, removedM2, retainedM2 }
}
