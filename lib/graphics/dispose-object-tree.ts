import type * as THREE from "three"
type Disposable = { dispose(): void }
/** Include shader-only textures and light shadow targets, not just material.map. */
export function disposeObjectTree(root: THREE.Object3D, release: (resource: Disposable) => void): void {
  const assets = new Set<Disposable>()
  const texture = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(texture)
    else if (value && typeof value === "object" && (value as THREE.Texture).isTexture) assets.add(value as THREE.Texture)
  }
  root.traverse((object) => {
    const mesh = object as THREE.Mesh,
      light = object as THREE.DirectionalLight
    if (mesh.geometry) assets.add(mesh.geometry)
    for (const material of Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) {
      Object.values(material).forEach(texture)
      for (const uniform of Object.values((material as THREE.ShaderMaterial).uniforms ?? {})) texture(uniform.value)
      assets.add(material)
    }
    if (light.shadow) assets.add(light.shadow)
  })
  const errors: unknown[] = []
  for (const asset of assets)
    try {
      release(asset)
    } catch (error) {
      errors.push(error)
    }
  if (errors.length) throw new AggregateError(errors, "Scene asset cleanup failed")
}
