import * as THREE from "three"
import { createInteriorHearthGeometry } from "#/world/scene/construction/create-interior-hearth-geometry"
import { fireLights } from "#/world/scene/construction/registry"
import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { Furniture } from "#/world/town/interiors"
import type { FlueSection } from "#/world/town/floorplan/types"
type Props = { root: THREE.Group; furniture: Furniture; floor: number; height: number; shaft: FlueSection | null }

/** Keep geometry and light placement together while both room kinds share their original material and flicker registration. */
export function addInteriorHearth(props: Props): Error | null {
  const f = props.furniture
  const mesh = createInteriorHearthGeometry(props)
  if (mesh instanceof Error) return mesh
  mesh.name = "hearth"
  props.root.add(mesh)
  const face = rectangleFace({ x: f.x, z: f.z, width: f.w, depth: f.d, side: f.hearthFront ?? "e" }),
    light = new THREE.PointLight(0xff8a3a, 2.2, 7, 1.4)
  light.name = "hearth-light"
  light.position.set(face.point[0] + face.outward[0] * 0.5, props.floor + (f.hearth ? (f.hearth.openingBottom + f.hearth.openingTop) / 2 : 0.6), face.point[1] + face.outward[1] * 0.5)
  props.root.add(light)
  fireLights.push({ light, base: 2.2, seed: f.x * 3 + f.z })

  return null
}
