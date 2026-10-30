import * as THREE from "three"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { RAMPS } from "#/world/scene/pix"
import { bayer } from "#/world/scene/bayer"
import { hash2 } from "#/lib/engine/hash2"
import { shaftMat } from "#/world/scene/construction/furniture"

export function wellShaftMat() {
  if (shaftMat.value) return shaftMat.value
  const W = 96,
    H = 48
  const b = new PixBuf(W, H)
  b.fill((px, py) => {
    const k = py / (H - 1) // 0 at the rim, 1 at the bottom
    if (bayer(px, py) + 0.47 < (k - 0.25) * 1.6) return [8, 6, 10]
    const row = Math.floor(py / 6),
      u = px / 10 + (row % 2) * 0.5,
      c = Math.floor(u),
      fu = u - c,
      fv = py / 6 - row
    if (fu < 0.08 || fv > 0.82) return RAMPS.stone[0]
    if (py < 10 && hash2(px >> 1, py >> 1, 4) > 0.55) return RAMPS.moss[2 + (hash2(px, py, 5) > 0.6 ? 1 : 0)]
    return RAMPS.stone[Math.max(0, 2 - Math.floor(k * 3) + (hash2(c, row, 6) > 0.7 ? 1 : 0))]
  })
  const t = toTex(b, false)
  t.wrapS = THREE.RepeatWrapping
  t.repeat.set(2, 1)
  shaftMat.value = new THREE.MeshLambertMaterial({ map: t, side: THREE.BackSide })
  return shaftMat.value
}
