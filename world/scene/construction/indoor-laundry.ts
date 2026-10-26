import * as THREE from "three"
import { PixBuf } from "../pix"
import { laundry, GPPU } from "../goods"
import { toTex } from "../gfx"

/** Still indoor laundry and its rope share one texture and one draw. */
export function indoorLaundry(length: number, seed: number): THREE.Mesh {
  const width = Math.max(1, Math.floor(length * GPPU))
  const strip = new PixBuf(width, 44)
  strip.rect(0, 1, width, 2, [100, 77, 50])
  let x = 6
  for (let i = 0; i < 20; i++) {
    const cloth = laundry(i, seed + i * 7)
    if (x + cloth.w > width - 6) break
    strip.blit(cloth, x, 2)
    x += cloth.w + 8
  }
  const material = new THREE.MeshLambertMaterial({ map: toTex(strip, false), alphaTest: 0.5, side: THREE.DoubleSide })
  const geometry = new THREE.PlaneGeometry(width / GPPU, strip.h / GPPU)
  geometry.translate(0, -strip.h / GPPU / 2, 0)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.name = "indoor-laundry"
  return mesh
}
