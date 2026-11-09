import { letter } from "#/world/scene/lettering"
import * as THREE from "three"

export function boardTex(text: string, ink: string, ground: string) {
  const c = document.createElement("canvas")
  c.width = 96
  c.height = 44
  const g = c.getContext("2d")!
  g.fillStyle = "#4a3428"
  g.fillRect(0, 0, 96, 44)
  g.fillStyle = ground
  g.fillRect(3, 3, 90, 38)
  g.fillStyle = ink
  letter({ g: g, lines: [text], cx: 48, cy: 23, width: 84, px: 22 })
  const t = new THREE.CanvasTexture(c)
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
