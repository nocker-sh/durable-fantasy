import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { roofTex } from "#/world/scene/textures/roof-tex"
import { thatchTex } from "#/world/scene/textures/thatch-tex"
import type { HouseStyle } from "#/world/town/style"
import { roofCache } from "#/world/scene/construction/houses"

export function roofMat(ramp: HouseStyle["roofRamp"], seed: number) {
  const key = `${ramp}:${seed % 3}`
  const m = { value: roofCache.get(key) }
  if (!m.value) {
    m.value = mat(ramp === "thatch" ? thatchTex(4 + (seed % 3) * 17) : roofTex({ ramp: ramp, light: ramp.startsWith("slate") ? 0.58 : 0.6, seed: 3 + (seed % 3) * 13 }), { side: THREE.DoubleSide })
    roofCache.set(key, m.value)
  }
  return m.value
}
