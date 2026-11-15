import * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"
import { groundH } from "#/world/scene/ground-h"
import { FLOWER_KINDS } from "#/world/scene/flower-kinds"
import type { FlowerKind } from "#/world/scene/flower-kinds"
import { sway } from "#/world/scene/fields/sway"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

const W = 24
const H = 24

/** Two planes crossed, a flower's width and height, standing on the ground. */
const bloomGeo = (() => {
  const a = new THREE.PlaneGeometry(0.72, 0.72).translate(0, 0.34, 0)
  const parts = [a, a.clone().rotateY(Math.PI / 2)].map((g) => g.toNonIndexed())
  const g = new THREE.BufferGeometry()
  for (const name of ["position", "uv", "normal"]) {
    const arrays = parts.map((p) => Array.from(p.attributes[name].array))
    g.setAttribute(name, new THREE.Float32BufferAttribute(arrays.flat(), name === "uv" ? 2 : 3))
  }
  return g
})()

/** A handful of one kind of flower seen from the side, each on its own stem, drawn in pixels. */
function bloomTexture(kind: FlowerKind, seed: number) {
  const b = new PixBuf(W, H)
  const r = new Rng(seed)
  const petals = kind.petals.map(hex)
  const heart = hex(kind.heart)
  const stem = RAMPS.grass[3]
  const leaf = RAMPS.grass[4]
  const put = (x: number, y: number, color: RGB) => {
    if (x >= 0 && x < W && y >= 0 && y < H) b.set({ x: x, y: y, color: color })
  }
  const count = kind.form === "mat" ? 13 : kind.form === "spike" || kind.form === "flag" ? 4 : 6
  for (let k = 0; k < count; k++) {
    const x0 = 2 + Math.round(((k + r.next() * 0.8) / count) * (W - 5))
    const h = Math.max(3, Math.round((9 + r.int(12)) * kind.tall))
    const lean = r.next() < 0.5 ? -1 : 1
    const top = H - 1 - h
    if (kind.form === "mat") {
      // fleshy jointed stubs, redder towards the tip
      for (let t = 0; t <= h; t++) put(x0 + (t > h * 0.6 && k % 3 === 0 ? lean : 0), H - 1 - t, petals[Math.min(2, Math.floor((t / (h + 1)) * 3))])
      if (k % 2 === 0) put(x0 + lean, H - 1 - Math.round(h * 0.5), petals[1])
      continue
    }
    const bow = kind.form === "bell" ? 3 : 1
    const at = (t: number) => x0 + Math.round((t / h) ** 2 * bow * lean)
    for (let t = 0; t < h; t++) put(at(t), H - 1 - t, stem)
    // leaves low on the stem
    put(x0 - 1, H - 2 - r.int(3), leaf)
    put(x0 + 1, H - 2 - r.int(3), leaf)
    if (kind.form === "spike") {
      // florets stacked up the stem, wide below and one pixel at the tip, lighter as they climb
      const from = Math.floor(h * 0.42)
      for (let t = from; t <= h; t++) {
        const f = (t - from) / Math.max(1, h - from)
        const c = petals[Math.min(2, Math.floor(f * 2.4 + r.next() * 0.6))]
        const y = H - 1 - t
        put(at(t), y, f > 0.9 ? heart : c)
        if (f < 0.82) {
          put(at(t) - 1, y, t % 2 ? c : petals[0])
          put(at(t) + 1, y, t % 2 ? petals[1] : c)
        }
      }
    } else if (kind.form === "head") {
      const x = at(h)
      const c = petals[1 + (k % 2)]
      put(x, top, heart)
      put(x - 1, top, petals[0])
      put(x + 1, top, c)
      put(x, top - 1, petals[2])
      put(x, top + 1, petals[1])
      if (kind.tall > 0.5) {
        put(x - 1, top - 1, c)
        put(x + 1, top - 1, petals[2])
      }
    } else if (kind.form === "bell") {
      // bells hanging from the bowed top of the stem
      for (let t = Math.floor(h * 0.5); t <= h; t += 2) {
        const x = at(t) + lean
        const y = H - 1 - t
        put(x, y, petals[1])
        put(x, y + 1, petals[2])
        put(x + lean, y + 1, petals[0])
      }
    } else if (kind.form === "plume") {
      const x = at(h)
      for (const d of [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [-1, -1],
        [1, 1],
        [0, 1],
      ])
        put(x + d[0], top + d[1], petals[1 + ((d[0] + d[1] + 2) % 2)])
      put(x + 1, top - 1, heart)
    } else {
      // flag: sword leaves beside the stem, three petals standing and two falling
      for (let t = 0; t < h * 0.75; t++) {
        put(x0 - 2 - Math.round((t / h) ** 2 * 2), H - 1 - t, leaf)
        put(x0 + 2 + Math.round((t / h) ** 2 * 2), H - 1 - t, RAMPS.moss[5])
      }
      const x = at(h)
      put(x, top, heart)
      put(x, top - 1, petals[2])
      put(x, top - 2, petals[2])
      put(x - 1, top - 1, petals[1])
      put(x + 1, top - 1, petals[1])
      put(x - 1, top, petals[1])
      put(x + 1, top, petals[1])
      put(x - 2, top + 1, petals[0])
      put(x + 2, top + 1, petals[0])
      put(x - 1, top + 1, petals[0])
      put(x + 1, top + 1, petals[0])
    }
  }
  return b
}

/** The same flowers seen from above: their heads open to the sky, a few leaves showing between. */
function capTexture(kind: FlowerKind, seed: number) {
  const b = new PixBuf(W, H)
  const r = new Rng(seed)
  const petals = kind.petals.map(hex)
  const heart = hex(kind.heart)
  const put = (x: number, y: number, color: RGB) => {
    if (x >= 0 && x < W && y >= 0 && y < H) b.set({ x: x, y: y, color: color })
  }
  for (let k = 0; k < 9; k++) put(2 + r.int(20), 2 + r.int(20), RAMPS.grass[3 + (k % 2)])
  const count = kind.form === "mat" ? 16 : 9
  for (let k = 0; k < count; k++) {
    const x = 2 + r.int(20)
    const y = 2 + r.int(20)
    if (kind.form === "mat") {
      put(x, y, petals[2])
      put(x + 1, y, petals[1])
      put(x, y + 1, petals[1])
      put(x + 1, y + 1, petals[0])
      continue
    }
    put(x - 1, y, petals[1])
    put(x + 1, y, petals[2])
    put(x, y - 1, petals[2])
    put(x, y + 1, petals[0])
    if (kind.tall > 0.5 && k % 2 === 0) {
      put(x - 1, y - 1, petals[2])
      put(x + 1, y + 1, petals[0])
      put(x + 1, y - 1, petals[1])
      put(x - 1, y + 1, petals[1])
    }
    put(x, y, heart)
  }
  return b
}

/** A flat cap of flower heads, held a little above the ground on stems too short to see. */
const capGeo = new THREE.PlaneGeometry(0.78, 0.78).rotateX(-Math.PI / 2)

type Drawn = { side: THREE.Material[]; cap: THREE.Material[] }

/** Two drawings of each kind, so a drift is not the same clump over and over. */
const MATERIALS = new Map<string, Drawn>()
const materialsOf = (name: string) => {
  const known = MATERIALS.get(name)
  if (known) return known
  const kind = FLOWER_KINDS[name]
  const seed = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  const capped = kind.form === "head" || kind.form === "mat" || kind.form === "plume"
  const made = {
    side: [0, 1].map((k) => mat(bloomTexture(kind, seed * 7 + k * 131), { alpha: true, side: THREE.DoubleSide })),
    cap: capped ? [0, 1].map((k) => mat(capTexture(kind, seed * 11 + k * 173), { alpha: true, side: THREE.DoubleSide })) : [],
  }
  MATERIALS.set(name, made)
  return made
}

/**
 * Flowers of one kind standing where the spots are, nodding in the wind. Drawn only: they block
 * nothing, so they can fill a drift from edge to edge.
 */
export function blooms(root: THREE.Group, name: string, spots: Spot[]) {
  const kind = FLOWER_KINDS[name]
  if (!kind) return
  const drawn = materialsOf(name)
  // low flowers are seen from above as a cushion of heads; only the taller ones show their stems
  const standing = drawn.cap.length === 0 || kind.tall > 0.6 || kind.form === "mat"
  if (standing)
    drawn.side.forEach((material, k) => {
      instanced({
        root: root,
        geo: bloomGeo,
        material: sway(material, 0.06),
        spots: spots.filter((_, i) => i % 2 === k),
        place: (s) => [
          [s.x, s.z],
          [0, s.r, 0],
          [s.s, s.s, s.s],
        ],
        shadow: false,
      })
    })
  const lift = kind.form === "mat" ? 0.05 : 0.08 + kind.tall * 0.5
  drawn.cap.forEach((material, k) => {
    instanced({
      root: root,
      geo: capGeo,
      material: sway(material, 0.04),
      spots: spots.filter((_, i) => i % 2 === k),
      place: (s) => [
        [s.x, groundH(s.x, s.z) + lift * s.s, s.z],
        [0, s.r, 0],
        [s.s, s.s, s.s],
      ],
      shadow: false,
    })
  })
}
