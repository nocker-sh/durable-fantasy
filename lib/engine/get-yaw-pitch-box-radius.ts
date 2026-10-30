type Props = Readonly<{ bounds: readonly [number, number, number, number, number, number]; maxPitch: number }>

/** For XYZ Euler rotation, yaw precedes pitch: reduce each corner's vertical angle by at most maxPitch, over every yaw and intermediate tilt. */
export function getYawPitchBoxRadius(props: Props): number | Error {
  const bounds = props.bounds,
    pitch = props.maxPitch
  if (![...bounds, pitch].every(Number.isFinite) || bounds[0] > bounds[3] || bounds[1] > bounds[4] || bounds[2] > bounds[5] || pitch < 0 || pitch > Math.PI / 2)
    return new Error("Invalid yaw/pitch box envelope")
  const corners = [bounds[0], bounds[3]].flatMap((x) => [bounds[1], bounds[4]].flatMap((y) => [bounds[2], bounds[5]].map((z) => [x, y, z])))
  const radii = corners.map((point) => {
    const horizontal = Math.hypot(point[0], point[2]),
      vertical = Math.abs(point[1])
    if (Math.atan2(vertical, horizontal) <= pitch) return Math.hypot(horizontal, vertical)
    return horizontal * Math.cos(pitch) + vertical * Math.sin(pitch)
  })

  const radius = Math.max(...radii)
  if (!Number.isFinite(radius)) return new Error("Unbounded yaw/pitch box envelope")

  return radius
}
