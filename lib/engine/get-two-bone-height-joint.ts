import { solveCoincidentTwoBoneAtHeight } from "#/lib/engine/solve-coincident-two-bone-at-height"
import type { Vector3 } from "#/lib/engine/vector3-types"
type Props = Readonly<{ root: Vector3; target: Vector3; pole: Vector3; height: number; upperRadiusSquared: number; lowerRadiusSquared: number }>

/** Intersect the two horizontal circles and choose the pole's side without changing the joint height. */
export function getTwoBoneHeightJoint(props: Props): Vector3 | undefined {
  const dx = props.target[0] - props.root[0],
    dz = props.target[2] - props.root[2],
    distance = Math.hypot(dx, dz)
  if (distance === 0) return solveCoincidentTwoBoneAtHeight(props)
  const along = (props.upperRadiusSquared - props.lowerRadiusSquared + distance * distance) / (2 * distance),
    heightSquared = props.upperRadiusSquared - along * along
  if (heightSquared < -1e-12) return undefined
  const x = props.root[0] + (dx / distance) * along,
    z = props.root[2] + (dz / distance) * along,
    height = Math.sqrt(Math.max(0, heightSquared)),
    side = (props.pole[0] - x) * -dz + (props.pole[2] - z) * dx < 0 ? -1 : 1
  return [x - ((side * dz) / distance) * height, props.height, z + ((side * dx) / distance) * height]
}
