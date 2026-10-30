import type { Vector3 } from "#/lib/engine/vector3-types"
type Props = Readonly<{ root: Vector3; pole: Vector3; height: number; upperRadiusSquared: number; lowerRadiusSquared: number }>

/** Coaxial target spheres share a horizontal circle only when its squared radii agree. */
export function solveCoincidentTwoBoneAtHeight(props: Props): Vector3 | undefined {
  if (Math.abs(props.upperRadiusSquared - props.lowerRadiusSquared) > 1e-12) return undefined
  const x = props.pole[0] - props.root[0]
  const z = props.pole[2] - props.root[2]
  const magnitude = Math.hypot(x, z)
  const radius = Math.sqrt(props.upperRadiusSquared)
  return [props.root[0] + radius * (magnitude ? x / magnitude : 1), props.height, props.root[2] + radius * (magnitude ? z / magnitude : 0)]
}
