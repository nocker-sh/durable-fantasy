import * as THREE from "three"
import type { FramedWindow } from "#/world/town/room-fixtures"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { glowMats, houseGlows } from "#/world/scene/construction/registry"

export function framedWindow(f: FramedWindow, floorY: number, house?: string): THREE.Group {
  const root = new THREE.Group(),
    gb = new GB(),
    nxState = f.outward,
    nx = nxState[0],
    nz = nxState[1],
    tx = -nz,
    tz = nx
  root.name = `window:${f.id}`
  const box = (inputProps: { u0: number; u1: number; y0: number; y1: number; depth: number; material: THREE.Material }) => {
    const u0 = inputProps.u0
    const u1 = inputProps.u1
    const y0 = inputProps.y0
    const y1 = inputProps.y1
    const depth = inputProps.depth
    const material = inputProps.material

    const point = (u: number, n: number) => [f.point[0] + tx * u + nx * (n - f.depth / 2), f.point[1] + tz * u + nz * (n - f.depth / 2)]
    const a = point(u0, -depth / 2),
      b = point(u1, depth / 2)
    gb.box({ side: material, top: material, x0: Math.min(a[0], b[0]), y0: floorY + y0, z0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: floorY + y1, z1: Math.max(a[1], b[1]), repeat: 2 })
  }
  const lo = f.sill,
    hi = lo + f.height,
    half = f.width / 2
  for (const side of [-1, 1]) box({ u0: side * (half - f.frame / 2) - f.frame / 2, u1: side * (half - f.frame / 2) + f.frame / 2, y0: lo, y1: hi, depth: f.depth, material: M.woodDark })
  for (const y of [lo, hi - f.frame]) box({ u0: -half, u1: half, y0: y, y1: y + f.frame, depth: f.depth, material: M.woodDark })
  box({ u0: -f.frame / 4, u1: f.frame / 4, y0: lo, y1: hi, depth: f.depth * 0.35, material: M.woodDark })
  box({ u0: -half, u1: half, y0: (lo + hi) / 2 - f.frame / 4, y1: (lo + hi) / 2 + f.frame / 4, depth: f.depth * 0.35, material: M.woodDark })
  const glass = new THREE.MeshLambertMaterial({ color: 0x9ab8d0, emissive: 0x6a88a8, emissiveIntensity: 0.15 })
  box({ u0: -half + f.frame, u1: half - f.frame, y0: lo + f.frame, y1: hi - f.frame, depth: f.frame * 0.15, material: glass })
  if (house) {
    glass.emissive.setHex(0xffb050)
    houseGlows.push({ house, floor: f.floor, mat: glass })
  }
  glowMats.push(glass)
  root.add(gb.build())
  return root
}
