import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

export function rentSign(root: THREE.Group, x: number, z: number) {
  const c = document.createElement("canvas")
  c.width = 64
  c.height = 32
  const g = c.getContext("2d")!
  g.fillStyle = "#c8b090"
  g.fillRect(0, 0, 64, 32)
  g.fillStyle = "#2a1e1a"
  g.font = 'bold 18px "DotGothic16", sans-serif'
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillText("貸家", 32, 17)
  const tex = new THREE.CanvasTexture(c)
  tex.magFilter = THREE.NearestFilter
  tex.colorSpace = THREE.SRGBColorSpace
  const y = groundH(x, z)
  const gb = new GB()
  gb.box({ side: M.woodDark, top: null, x0: x - 0.03, y0: y, z0: z - 0.03, x1: x + 0.03, y1: y + 0.9, z1: z + 0.03, repeat: 1 })
  root.add(gb.build())
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }))
  m.position.set(x, y + 0.85, z + 0.04)
  root.add(m)
  blockCircle(x, z, 0.15)
}
