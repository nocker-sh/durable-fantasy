import * as THREE from "three"

type Props = {
  root: THREE.Group
  at: readonly [number, number, number]
  /** tilt about x, heading about y, roll about z, in radians; the heading is applied last */
  turn?: readonly [number, number, number]
  radius: number
  /** the radius at the far end, when the drum tapers */
  radiusTop?: number
  length: number
  material: THREE.Material
  segments?: number
}

/**
 * A closed drum standing on its end until it is turned: a length of fallen column, a boiler, a
 * wheel lying in the grass, a gun barrel.
 */
export function drum(props: Props): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(props.radiusTop ?? props.radius, props.radius, props.length, props.segments ?? 9), props.material)
  mesh.position.set(props.at[0], props.at[1], props.at[2])
  if (props.turn) mesh.rotation.set(props.turn[0], props.turn[1], props.turn[2], "YXZ")
  mesh.castShadow = true
  mesh.receiveShadow = true
  props.root.add(mesh)
  return mesh
}
