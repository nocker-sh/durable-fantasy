import type { WINDMILL_ROTOR_SHAPE } from "#/world/scene/construction/windmill-rotor-shape"
type Props = Readonly<{ shape: typeof WINDMILL_ROTOR_SHAPE }>

/** A full rotation sweeps each rectangle's farthest corner around the hub; keep beam depth and the cloth plane. */
export function getWindmillRotorSweep(props: Props) {
  const shape = props.shape,
    beam = shape.beam,
    sail = shape.sail
  if (
    ![...shape.hub, ...beam.size, ...beam.centre, ...sail.size, ...sail.centre].every(Number.isFinite) ||
    !Number.isSafeInteger(shape.arms) ||
    shape.arms < 1 ||
    !Number.isFinite(shape.angularSpeed) ||
    beam.size.some((value) => value <= 0) ||
    sail.size.some((value) => value <= 0)
  )
    return new Error("Invalid windmill rotor geometry")
  const radius = Math.max(
    Math.hypot(Math.abs(beam.centre[0]) + beam.size[0] / 2, Math.abs(beam.centre[1]) + beam.size[1] / 2),
    Math.hypot(Math.abs(sail.centre[0]) + sail.size[0] / 2, Math.abs(sail.centre[1]) + sail.size[1] / 2),
  )
  const bounds = {
    x0: shape.hub[0] - radius,
    x1: shape.hub[0] + radius,
    bottom: shape.hub[1] - radius,
    top: shape.hub[1] + radius,
    z0: shape.hub[2] + Math.min(beam.centre[2] - beam.size[2] / 2, sail.centre[2]),
    z1: shape.hub[2] + Math.max(beam.centre[2] + beam.size[2] / 2, sail.centre[2]),
  }
  if (![radius, ...Object.values(bounds)].every(Number.isFinite)) return new Error("Unbounded windmill rotor sweep")
  return { radius, bounds }
}
