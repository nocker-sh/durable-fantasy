import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { hash2 } from "#/lib/engine/hash2"
import { RAMPS } from "#/world/scene/pix"
import { blockCircle } from "#/world/scene/block-circle"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

// a column of salt grown up out of the flat: six-sided, its sides ridged where the brine ran down,
// broken off jagged at the top rather than rounded
const pillarGeo = (() => {
  const g = new THREE.CylinderGeometry(0.26, 0.4, 1, 6, 4, false).translate(0, 0.5, 0)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i),
      a = Math.atan2(p.getZ(i), p.getX(i))
    const k = Math.round((a / Math.PI) * 3 + 3)
    const bulge = 1 + (hash2(k, Math.round(y * 4), 401) - 0.5) * 0.35
    p.setX(i, p.getX(i) * bulge)
    p.setZ(i, p.getZ(i) * bulge)
    // the top: each corner at its own height, so it reads as snapped crystal
    if (y > 0.99) p.setY(i, 0.78 + hash2(k, 7, 402) * 0.4)
  }
  g.computeVertexNormals()
  return g
})()

const saltMat = (() => {
  const b = new PixBuf(16, 32)
  const r = new Rng(403)
  for (let y = 0; y < 32; y++)
    for (let x = 0; x < 16; x++) {
      const streak = (x * 5 + Math.floor(y / 6)) % 7 === 0
      const lvl = streak ? 3 : 4 + (r.next() < 0.25 ? 1 : 0) - (y > 26 ? 1 : 0)
      b.set({ x, y, color: r.next() < 0.06 ? RAMPS.cRose[4] : RAMPS.frost[lvl] })
    }
  return mat(b)
})()

export function saltPillars(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: pillarGeo,
    material: saltMat,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [hash2(s.x * 10, s.z * 10, 404) * 0.3 - 0.15, s.r, hash2(s.x * 10, s.z * 10, 405) * 0.3 - 0.15],
      [s.s * 1.3, s.s * (0.9 + hash2(s.x * 10, s.z * 10, 406) * 2), s.s * 1.3],
    ],
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.32 * s.s)
}
