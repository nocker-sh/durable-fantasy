import * as THREE from "three"

export function signTex(word: string) {
  const c = document.createElement("canvas")
  c.width = 64
  c.height = 40
  const g = c.getContext("2d")!
  g.fillStyle = "#3a2a20"
  g.fillRect(0, 0, 64, 40)
  g.fillStyle = "#a88a60"
  g.fillRect(3, 3, 58, 34)
  g.fillStyle = "#2a1c14"
  g.font = `bold ${word.length > 2 ? 15 : 20}px "DotGothic16", sans-serif`
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillText(word, 32, 21)
  const t = new THREE.CanvasTexture(c)
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
