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
  g.font = 'bold 26px "DotGothic16", sans-serif'
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillText(text, 48, 23)
  const t = new THREE.CanvasTexture(c)
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
