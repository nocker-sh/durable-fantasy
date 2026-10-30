import * as THREE from "three"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { laundry } from "#/world/scene/laundry"
import { GPPU } from "#/world/scene/goods"
import { toTexture as toTex } from "#/lib/graphics/to-texture"

/** Still indoor laundry and its rope share one texture and one draw. */
export function indoorLaundry(length: number, seed: number): THREE.Mesh {
  const width = Math.max(1, Math.floor(length * GPPU))
  const strip = new PixBuf(width, 44)
  strip.rect({ x: 0, y: 1, width: width, height: 2, color: [100, 77, 50] })
  let x = 6
  for (let i = 0; i < 20; i++) {
    const cloth = laundry(i, seed + i * 7)
    if (x + cloth.w > width - 6) break
    strip.blit({ source: cloth, x: x, y: 2 })
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
