import { Mesh, RingGeometry, MeshBasicMaterial, EdgesGeometry, PlaneGeometry, LineSegments, LineBasicMaterial } from "three"
import { CELL } from "#/world/scene/runtime/grid"
import type { Scene } from "three"

/** 道の奥を選んだ場合も既存の輪とカーソルを家の手前へ描く。 */
export function createWalkMarkers(scene: Scene) {
  const marker = new Mesh(new RingGeometry(0.16, 0.24, 16), new MeshBasicMaterial({ color: 0xffe080, transparent: true, opacity: 0.85, depthTest: false }))
  marker.rotation.x = -Math.PI / 2
  marker.visible = false
  const cursorGeo = new EdgesGeometry(new PlaneGeometry(CELL * 0.92, CELL * 0.92).rotateX(-Math.PI / 2))
  const cursor = new LineSegments(cursorGeo, new LineBasicMaterial({ color: 0xfff4d0, transparent: true, opacity: 0.7, depthTest: false }))
  cursor.visible = false
  marker.renderOrder = cursor.renderOrder = 999
  scene.add(marker, cursor)
  return { marker, cursor }
}
