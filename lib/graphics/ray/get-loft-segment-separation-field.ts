import type { Ring } from "#/lib/graphics/ray/distance-types"
import type { PrimitiveBounds } from "./primitive-bounds-types"
import type { Vector3Tuple as V3 } from "../../engine/vector3-types"
import type { BoundedField } from "../../engine/field-separation"
type Props = { from: Ring; to: Ring; axis: V3; x: V3; z: V3; lengthSquared: number; bounds: PrimitiveBounds | null; value: (point: V3) => number }

/** Bound the actual clamped elliptical loft field's derivatives on its segment domain; no unit-distance assumption is made. */
export function getLoftSegmentSeparationField(props: Props): BoundedField | Error {
  const box = props.bounds,
    values = [...props.from.c, ...props.to.c, ...props.axis, ...props.x, ...props.z, props.from.w, props.to.w, props.from.d, props.to.d, props.lengthSquared]
  if (
    !box ||
    ![...values, ...box.min, ...box.max].every(Number.isFinite) ||
    box.min.some((value, axis) => value > box.max[axis]) ||
    Math.min(props.from.w, props.to.w, props.from.d, props.to.d, props.lengthSquared) <= 0
  )
    return new Error("Invalid loft separation segment")
  const centre = box.min.map((value, axis) => (value + box.max[axis]) / 2),
    half = box.min.map((value, axis) => (box.max[axis] - value) / 2)
  const extent = (direction: V3) =>
    Math.abs(direction.reduce((sum, value, axis) => sum + value * (centre[axis] - props.from.c[axis]), 0)) +
    direction.reduce((sum, value, axis) => sum + Math.abs(value) * half[axis], 0) +
    Math.abs(direction.reduce((sum, value, axis) => sum + value * props.axis[axis], 0))
  const a = extent(props.x),
    b = extent(props.z),
    width = Math.min(props.from.w, props.to.w),
    depth = Math.min(props.from.d, props.to.d),
    axisLength = Math.hypot(...props.axis),
    tSpeed = axisLength / props.lengthSquared
  const widthSpeed = Math.abs(props.to.w - props.from.w) * tSpeed,
    depthSpeed = Math.abs(props.to.d - props.from.d) * tSpeed,
    projection = Math.max(1, Math.abs(1 - axisLength ** 2 / props.lengthSquared))
  const ex = (Math.hypot(...props.x) * projection) / width + (a * widthSpeed) / width ** 2,
    ez = (Math.hypot(...props.z) * projection) / depth + (b * depthSpeed) / depth ** 2
  const radial =
    Math.min(Math.max(props.from.w, props.to.w), Math.max(props.from.d, props.to.d)) * Math.hypot(ex, ez) + Math.max(1, Math.hypot(a / width, b / depth) - 1) * Math.max(widthSpeed, depthSpeed)
  const lipschitz = Math.max(radial, tSpeed * Math.sqrt(props.lengthSquared)) * (1 + 1e-12) + 1e-12
  if (!Number.isFinite(lipschitz) || lipschitz <= 0) return new Error("Unbounded loft separation field")

  return { min: [...box.min], max: [...box.max], value: props.value, lipschitz }
}
