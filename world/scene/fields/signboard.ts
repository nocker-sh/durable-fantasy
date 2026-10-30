import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

// ---------------------------------------------------------------- landmarks
type Props = {
  root: THREE.Group
  x: number
  z: number
  lines: string[]
  rot?: number
}

export function signboard(props: Props) {
  const rot = props.rot === undefined ? 0 : props.rot

  const c = document.createElement("canvas")
  c.width = 256
  c.height = 128
  const g = c.getContext("2d")!
  g.fillStyle = "#b08a5e"
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = "#8a6a48"
  for (const y = { value: 0 }; y.value < 128; y.value += 32) g.fillRect(0, y.value, 256, 3)
  g.fillStyle = "#1e1410"
  g.font = 'bold 34px "DotGothic16", sans-serif'
  g.textAlign = "center"
  g.textBaseline = "middle"
  const size = Math.min(34, Math.floor(236 / Math.max(...props.lines.map((l) => l.length))))
  g.font = `bold ${size}px "DotGothic16", sans-serif`
  props.lines.forEach((l, i) => g.fillText(l, 128, 64 + (i - (props.lines.length - 1) / 2) * (size + 8)))
  const tex = new THREE.CanvasTexture(c)
  tex.magFilter = THREE.NearestFilter
  tex.colorSpace = THREE.SRGBColorSpace
  const grp = new THREE.Group()
  const y0 = groundH(props.x, props.z)
  const gb = new GB()
  gb.box({ side: M.woodDark, top: null, x0: -0.5, y0: 0, z0: -0.04, x1: -0.42, y1: 1.3, z1: 0.04, repeat: 2 })
  gb.box({ side: M.woodDark, top: null, x0: 0.42, y0: 0, z0: -0.04, x1: 0.5, y1: 1.3, z1: 0.04, repeat: 2 })
  grp.add(gb.build())
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }))
  board.position.set(0, 1.0, 0.05)
  board.castShadow = true
  grp.add(board)
  grp.position.set(props.x, y0, props.z)
  grp.rotation.y = rot
  props.root.add(grp)
  blockCircle(props.x, props.z, 0.5)
}
