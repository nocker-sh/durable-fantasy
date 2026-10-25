import * as THREE from "three";
import type { PixelBuffer } from "./pixel-buffer";

export function toTex(b: PixelBuffer, repeat = true): THREE.Texture {
  const t = new THREE.DataTexture(b.data, b.w, b.h, THREE.RGBAFormat);
  t.flipY = true;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapNearestFilter;
  t.generateMipmaps = true;
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

const matCache = new Map<PixelBuffer, THREE.MeshLambertMaterial>();
export function mat(b: PixelBuffer, opts: { repeat?: boolean; alpha?: boolean; side?: THREE.Side; emissive?: number } = {}): THREE.MeshLambertMaterial {
  const hit = matCache.get(b);
  if (hit && !opts.alpha && !opts.side) return hit;
  const m = new THREE.MeshLambertMaterial({
    map: toTex(b, opts.repeat ?? true),
    alphaTest: opts.alpha ? 0.5 : 0,
    side: opts.side ?? THREE.FrontSide,
  });
  if (opts.emissive !== undefined) {
    m.emissive = new THREE.Color(opts.emissive);
    m.emissiveMap = m.map;
  }
  if (!opts.alpha && !opts.side) matCache.set(b, m);
  return m;
}

export function colorMat(c: number): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color: c });
}
