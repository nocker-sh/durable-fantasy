import { placePreviewCamera } from "#/dev/place-preview-camera"
import { SceneResources } from "#/lib/graphics/scene-resources"
import * as THREE from "three"
import { updaters } from "#/world/scene/construction/registry"
import type { Build } from "#/dev/three-view"
import { stage } from "#/dev/stage"

const shared: { value: THREE.WebGLRenderer | null } = { value: null }
const thumbs = new Map<string, string>()

/** A still of the thing at `px` pixels square, drawn once and kept. */
export function thumbUrl(key: string, build: Build, px = 40): string {
  const cacheKey = `${px}:${key}`
  const known = thumbs.get(cacheKey)
  if (known) return known
  shared.value ??= new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: true })
  shared.value.setPixelRatio(1)
  shared.value.setSize(px, px)
  shared.value.shadowMap.enabled = true
  shared.value.outputColorSpace = THREE.SRGBColorSpace
  const preview = stage(build, false),
    scene = preview.scene
  const resources = new SceneResources(scene)
  try {
    scene.background = null
    scene.children.filter((c) => c instanceof THREE.Mesh).forEach((c) => scene.remove(c))
    const cam = new THREE.PerspectiveCamera(24, 1, 0.05, 200)
    placePreviewCamera({ camera: cam, frame: preview, turn: 0.6 })
    updaters.forEach((u) => u(0, 0))
    shared.value.render(scene, cam)
    const url = shared.value.domElement.toDataURL()
    thumbs.set(cacheKey, url)
    return url
  } finally {
    resources.dispose()
    shared.value.renderLists.dispose()
  }
}
