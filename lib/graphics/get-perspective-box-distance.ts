import { Vector3 } from "three"
type Props = Readonly<{ size: readonly [number, number, number]; outward: readonly [number, number, number]; fovDegrees: number; aspect: number; padding: number; near: number }>

/** Fit every box corner to both perspective axes; padding scales its projected extent, not a guessed world-space radius. */
export function getPerspectiveBoxDistance(props: Props): number | Error {
  if (
    ![...props.size, ...props.outward, props.fovDegrees, props.aspect, props.padding, props.near].every(Number.isFinite) ||
    props.size.some((size) => size < 0) ||
    props.fovDegrees <= 0 ||
    props.fovDegrees >= 180 ||
    props.aspect <= 0 ||
    props.padding < 1 ||
    props.near <= 0
  )
    return new Error("Invalid perspective box framing")
  const outward = new Vector3(...props.outward).normalize(),
    right = new Vector3().crossVectors(new Vector3(0, 1, 0), outward).normalize()
  if (outward.lengthSq() === 0 || right.lengthSq() === 0) return new Error("Perspective box framing has no horizontal camera basis")
  const up = new Vector3().crossVectors(outward, right),
    tanVertical = Math.tan((props.fovDegrees * Math.PI) / 360),
    tanHorizontal = tanVertical * props.aspect
  const frame = { distance: props.near }
  for (const x of [-0.5, 0.5])
    for (const y of [-0.5, 0.5])
      for (const z of [-0.5, 0.5]) {
        const corner = new Vector3(props.size[0] * x, props.size[1] * y, props.size[2] * z),
          depth = corner.dot(outward)
        frame.distance = Math.max(
          frame.distance,
          depth + props.near,
          depth + (props.padding * Math.abs(corner.dot(right))) / tanHorizontal,
          depth + (props.padding * Math.abs(corner.dot(up))) / tanVertical,
        )
      }
  if (!Number.isFinite(frame.distance)) return new Error("Unbounded perspective box framing")

  return frame.distance
}
