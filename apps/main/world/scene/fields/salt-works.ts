import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { blockCircle } from "#/world/scene/block-circle"
import { sack } from "#/world/scene/construction/sack"
import { barrel } from "#/world/scene/construction/barrel"

const brine = colorMat(0xb4bcc4)
const crust = colorMat(0xe6e8e8)
const heapMat = colorMat(0xeeeeea)

/**
 * The salt works at the end of the road: shallow pans walled with boards where the brine is let in
 * and left to dry, white heaps raked up beside them, and a lean-to where the rakers keep their
 * tools and sleep through the hot middle of the day. The salt goes to town in sacks (map-salt-flats).
 */
export function saltWorks(root: THREE.Group, x: number, z: number) {
  const g = new GB()
  const y = (px: number, pz: number) => groundH(px, pz)
  // the pans: two rows of three, each a low board rim with brine or a drying crust inside
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 3; col++) {
      const x0 = x + 1.4 + col * 2.4,
        z0 = z - 3.2 + row * 2.6
      const x1 = x0 + 2,
        z1 = z0 + 2.1
      const h = Math.min(y(x0, z0), y(x1, z1)) + 0.02
      const inside = (row + col) % 3 === 0 ? crust : brine
      g.quad({ material: inside, a: [x0, h + 0.05, z1], b: [x1, h + 0.05, z1], c: [x1, h + 0.05, z0], d: [x0, h + 0.05, z0] })
      for (const e of [
        [x0, z0, x1, z0 + 0.08],
        [x0, z1 - 0.08, x1, z1],
        [x0, z0, x0 + 0.08, z1],
        [x1 - 0.08, z0, x1, z1],
      ])
        g.box({ side: M.woodDark, top: M.wood, x0: e[0], y0: h - 0.1, z0: e[1], x1: e[2], y1: h + 0.12, z1: e[3], repeat: 1 })
      blockRect({ x0: x0, z0: z0, x1: x1, z1: z1 })
    }
  // the heaps, raked into cones, one half-bagged
  for (const hp of [
    [x + 9.2, z - 2.6, 0.75],
    [x + 9.6, z - 0.6, 0.6],
    [x + 8.6, z + 1.2, 0.5],
  ]) {
    g.cyl({ side: heapMat, top: heapMat, centerX: hp[0], centerZ: hp[1], fromY: y(hp[0], hp[1]) - 0.05, toY: y(hp[0], hp[1]) + hp[2] * 0.9, fromRadius: hp[2], toRadius: 0.04, segments: 8 })
    blockCircle(hp[0], hp[1], hp[2] * 0.8)
  }
  // the lean-to: four posts, a thatched roof sloping to the back
  const lx = x - 1.6,
    lz = z - 2.4,
    ly = y(lx, lz)
  for (const p of [
    [lx - 1.2, lz - 1, 1.5],
    [lx + 1.2, lz - 1, 1.5],
    [lx - 1.2, lz + 1, 2.1],
    [lx + 1.2, lz + 1, 2.1],
  ])
    g.cyl({ side: M.woodDark, top: null, centerX: p[0], centerZ: p[1], fromY: ly - 0.1, toY: ly + p[2], fromRadius: 0.07, segments: 5 })
  g.quad({ material: M.thatch, a: [lx - 1.45, ly + 1.4, lz - 1.3], b: [lx + 1.45, ly + 1.4, lz - 1.3], c: [lx + 1.45, ly + 2.15, lz + 1.25], d: [lx - 1.45, ly + 2.15, lz + 1.25] })
  g.quad({ material: M.thatch, a: [lx + 1.45, ly + 1.4, lz - 1.3], b: [lx - 1.45, ly + 1.4, lz - 1.3], c: [lx - 1.45, ly + 2.15, lz + 1.25], d: [lx + 1.45, ly + 2.15, lz + 1.25] })
  // a sleeping mat and a back wall of boards against the wind
  g.box({ side: M.woodDark, top: M.wood, x0: lx - 1.2, y0: ly - 0.05, z0: lz + 0.95, x1: lx + 1.2, y1: ly + 1.6, z1: lz + 1.02, repeat: 1 })
  g.box({ side: M.linen, top: M.linen, x0: lx - 0.9, y0: ly, z0: lz - 0.2, x1: lx + 0.2, y1: ly + 0.08, z1: lz + 0.7, repeat: 1 })
  // rakes leaning on the wall: long handles with a crossbar
  for (const k of [0, 1]) {
    const rx = lx + 0.6 + k * 0.35,
      rz = lz + 0.85
    g.box({ side: M.wood, top: null, x0: rx - 0.025, y0: ly, z0: rz - 0.18, x1: rx + 0.025, y1: ly + 1.5, z1: rz - 0.13, repeat: 1 })
    g.box({ side: M.woodDark, top: null, x0: rx - 0.22, y0: ly + 1.45, z0: rz - 0.2, x1: rx + 0.22, y1: ly + 1.52, z1: rz - 0.1, repeat: 1 })
  }
  blockRect({ x0: lx - 1.3, z0: lz - 1.1, x1: lx + 1.3, z1: lz + 1.1 })
  sack({ gb: g, x: x + 7.6, z: z - 1.8 })
  sack({ gb: g, x: x + 7.9, z: z - 1.2 })
  sack({ gb: g, x: x + 7.4, z: z - 0.9 })
  barrel({ gb: g, x: lx + 1.6, z: lz + 0.4 })
  root.add(g.build())
}
