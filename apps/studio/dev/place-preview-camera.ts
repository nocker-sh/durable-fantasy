import type { PerspectiveCamera, Vector3 } from "three"
import { getPerspectiveBoxDistance } from "#/lib/graphics/get-perspective-box-distance"
type Props = Readonly<{ camera: PerspectiveCamera; frame: Readonly<{ centre: Vector3; size: Vector3 }>; turn: number }>

/** Preserve the preview's viewing angle and pixel scale while fitting all geometry after resize or rotation. */
export function placePreviewCamera(props: Props): void {
  const camera = props.camera,
    centre = props.frame.centre,
    size = props.frame.size
  const outward: [number, number, number] = [Math.sin(props.turn) * 0.8, 0.6, Math.cos(props.turn) * 0.8]
  const distance = getPerspectiveBoxDistance({ size: [size.x, size.y, size.z], outward, fovDegrees: camera.fov, aspect: camera.aspect, padding: 1.1, near: camera.near })
  if (distance instanceof Error) throw distance
  camera.position.set(centre.x + outward[0] * distance, centre.y + outward[1] * distance, centre.z + outward[2] * distance)
  const far = Math.max(200, distance + size.length())
  if (camera.far !== far) {
    camera.far = far
    camera.updateProjectionMatrix()
  }
  camera.lookAt(centre)
}
