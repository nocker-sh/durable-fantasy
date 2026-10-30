import * as THREE from "three"
import { toTexture } from "./to-texture"
import type { PixelBuffer } from "./pixel-buffer"
import type { TexturedMaterialOptions } from "./material-types"
type Props = Readonly<{ pixels: PixelBuffer; options: TexturedMaterialOptions }>

/** Create one owned material and texture without joining the shared variants. */
export function createTexturedMaterial(props: Props): THREE.MeshLambertMaterial {
  const material = new THREE.MeshLambertMaterial({ map: toTexture(props.pixels, props.options.repeat ?? true), alphaTest: props.options.alpha ? 0.5 : 0, side: props.options.side ?? THREE.FrontSide })
  if (props.options.emissive !== undefined) {
    material.emissive = new THREE.Color(props.options.emissive)
    material.emissiveMap = material.map
  }
  return material
}
