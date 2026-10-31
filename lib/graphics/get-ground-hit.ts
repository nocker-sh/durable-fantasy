import type { Object3D, Raycaster } from "three"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

type Props = Readonly<{
  ray: Pick<Raycaster, "intersectObject">
  terrain: Object3D
  structures: Object3D
  isFree(x: number, z: number): boolean
}>

/** 空いた地面を屋根より優先し、塞がれた地面では橋や段の歩ける面を探す。 */
export function getGroundHit(props: Props): Vector2Tuple | null {
  const terrain = props.ray.intersectObject(props.terrain)[0]
  if (terrain && props.isFree(terrain.point.x, terrain.point.z)) return [terrain.point.x, terrain.point.z]
  const structure = props.ray.intersectObject(props.structures, true).find((hit) => props.isFree(hit.point.x, hit.point.z))
  const hit = structure ?? terrain
  return hit ? [hit.point.x, hit.point.z] : null
}
