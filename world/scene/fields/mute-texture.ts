import * as THREE from "three"

const cache = new Map<string, THREE.Texture>()

type Props = { map: THREE.Texture; tint: number; amount: number }

/** Keep a painted texture's light and shade but pull its colours toward one muted tint, as the town's palette is. */
export function muteTexture(props: Props): THREE.Texture {
  const key = `${props.map.uuid}:${props.tint}:${props.amount}`
  const hit = cache.get(key)
  if (hit) return hit
  const image = props.map.image as CanvasImageSource & { width: number; height: number }
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(image, 0, 0)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const tint = [(props.tint >> 16) & 255, (props.tint >> 8) & 255, props.tint & 255]
  for (let i = 0; i < data.data.length; i += 4) {
    const light = (data.data[i] * 0.3 + data.data[i + 1] * 0.59 + data.data[i + 2] * 0.11) / 255
    for (let k = 0; k < 3; k++) data.data[i + k] = data.data[i + k] * (1 - props.amount) + Math.min(255, tint[k] * (0.35 + light * 1.3)) * props.amount
  }
  ctx.putImageData(data, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.flipY = props.map.flipY
  texture.magFilter = THREE.NearestFilter
  texture.colorSpace = THREE.SRGBColorSpace
  cache.set(key, texture)
  return texture
}
