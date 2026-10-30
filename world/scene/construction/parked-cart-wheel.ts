import { BoxGeometry, CylinderGeometry, Group, InstancedMesh, Matrix4, Mesh, TorusGeometry } from "three"
import { PARKED_CART_SHAPE } from "#/world/town/parked-cart-shape"
import { M } from "#/world/scene/construction/materials"

/** The hub and rim meet all radial spokes; the wheel axis is the cart's transverse X axis. */
export function parkedCartWheel(): Group {
  const shape = PARKED_CART_SHAPE.wheel,
    wheel = new Group()
  const rim = new Mesh(new TorusGeometry(shape.radius - shape.rim, shape.rim, 6, 12), M.woodDark)
  rim.name = "rim"
  rim.rotation.y = Math.PI / 2
  const hub = new Mesh(new CylinderGeometry(shape.hubRadius, shape.hubRadius, shape.hubWidth, 10), M.woodDark)
  hub.name = "hub"
  hub.rotation.z = Math.PI / 2
  const spokes = new InstancedMesh(new BoxGeometry(shape.spokeThickness, shape.spokeLength, shape.spokeThickness), M.wood, shape.spokes)
  spokes.name = "spokes"
  for (const index of Array.from({ length: shape.spokes }).keys()) {
    const angle = (index * Math.PI * 2) / shape.spokes,
      matrix = new Matrix4().makeRotationX(angle)
    matrix.setPosition(0, Math.cos(angle) * shape.spokeRadius, Math.sin(angle) * shape.spokeRadius)
    spokes.setMatrixAt(index, matrix)
  }
  spokes.instanceMatrix.needsUpdate = true
  spokes.computeBoundingBox()
  spokes.computeBoundingSphere()
  wheel.add(rim, hub, spokes)

  return wheel
}
