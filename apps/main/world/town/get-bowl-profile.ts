type Props = { diameter: number; height: number; baseDiameter: number; wall: number; bottom: number }

/** A rotationally symmetric open bowl with a flat base; wall denotes horizontal radial thickness. */
export function getBowlProfile(props: Props) {
  if (Object.values(props).some((value) => !Number.isFinite(value) || value <= 0)) return new Error("Invalid bowl dimensions")
  const base = props.baseDiameter / 2,
    rim = props.diameter / 2
  if (base > rim || props.wall >= base || props.bottom >= props.height) return new Error("Bowl has no usable hollow or flat base")
  const innerBottom = base + ((rim - base) * props.bottom) / props.height - props.wall
  const innerRim = rim - props.wall,
    innerHeight = props.height - props.bottom
  const capacity = (Math.PI * innerHeight * (innerBottom * innerBottom + innerBottom * innerRim + innerRim * innerRim)) / 3
  if (!Number.isFinite(capacity) || capacity <= 0) return new Error("Invalid bowl capacity")
  const outerProfile = [
    [0, 0],
    [base, 0],
    [rim, props.height],
  ] satisfies [number, number][]
  const innerProfile = [
    [innerRim, props.height],
    [innerBottom, props.bottom],
    [0, props.bottom],
  ] satisfies [number, number][]

  return { outerProfile, innerProfile, capacity, floorContactRadius: base, rimContactRadius: rim - props.wall / 2 }
}
