import { Group, Mesh, BoxGeometry, IcosahedronGeometry } from "three"
import { SHEEP_SHAPE } from "#/world/town/sheep-shape"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"

/** Keep the native geometry and child order while sharing its dimensions with the pasture occupancy check. */
export function sheepMesh(): Group {
  const root = new Group(),
    shape = SHEEP_SHAPE.wool,
    body = new Mesh(new IcosahedronGeometry(shape.radius, shape.detail), M.wool)
  body.scale.set(...shape.scale)
  body.position.set(...shape.position)
  root.add(body)
  for (const box of SHEEP_SHAPE.boxes) {
    const part = new Mesh(new BoxGeometry(...box.dimensions), colorMat(box.color))
    part.position.set(...box.position)
    root.add(part)
  }
  root.traverse((object) => {
    object.castShadow = true
  })

  return root
}
