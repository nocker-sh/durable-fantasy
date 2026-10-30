import { BoxGeometry, Group, Mesh } from "three"
import { PARKED_CART_SHAPE } from "#/world/town/parked-cart-shape"
import { M } from "#/world/scene/construction/materials"

/** Named structural parts share one cube geometry; their contacts remain inspectable before loading or motion is designed. */
export function parkedCartFrame(): Group {
  const frame = new Group(),
    box = new BoxGeometry(1, 1, 1)
  frame.name = "frame"
  for (const part of PARKED_CART_SHAPE.boxes) {
    const bounds = part.bounds,
      mesh = new Mesh(box, M[part.material])
    mesh.name = part.name
    mesh.scale.set(bounds[3] - bounds[0], bounds[4] - bounds[1], bounds[5] - bounds[2])
    mesh.position.set((bounds[0] + bounds[3]) / 2, (bounds[1] + bounds[4]) / 2, (bounds[2] + bounds[5]) / 2)
    frame.add(mesh)
  }

  return frame
}
