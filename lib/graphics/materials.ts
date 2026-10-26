import * as THREE from "three"
import type { PixelBuffer } from "./pixel-buffer"

export function toTex(b: PixelBuffer, repeat = true): THREE.Texture {
  const t = new THREE.DataTexture(b.data, b.w, b.h, THREE.RGBAFormat)
  t.flipY = true
  t.magFilter = THREE.NearestFilter
  t.minFilter = THREE.NearestMipmapNearestFilter
  t.generateMipmaps = true
  t.colorSpace = THREE.SRGBColorSpace
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}

// A cache must not keep procedural map images alive after their scene is gone.
const matCache = new WeakMap<PixelBuffer, Map<string, THREE.MeshLambertMaterial>>()
export function mat(b: PixelBuffer, opts: { repeat?: boolean; alpha?: boolean; side?: THREE.Side; emissive?: number } = {}): THREE.MeshLambertMaterial {
  const share = !opts.alpha && !opts.side
  const key = `${opts.repeat ?? true}|${opts.emissive ?? "none"}`
  let variants = matCache.get(b)
  const hit = variants?.get(key)
  if (share && hit) return hit
  const m = new THREE.MeshLambertMaterial({
    map: toTex(b, opts.repeat ?? true),
    alphaTest: opts.alpha ? 0.5 : 0,
    side: opts.side ?? THREE.FrontSide,
  })
  if (opts.emissive !== undefined) {
    m.emissive = new THREE.Color(opts.emissive)
    m.emissiveMap = m.map
  }
  if (!share) return m
  if (!variants) {
    variants = new Map()
    matCache.set(b, variants)
  }
  variants.set(key, m)
  const entries = variants
  m.addEventListener("dispose", () => {
    if (entries.get(key) === m) entries.delete(key)
  })
  return m
}

export function colorMat(c: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color: c })
}
