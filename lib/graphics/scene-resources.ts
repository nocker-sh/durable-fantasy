import * as THREE from "three"

/** Collect an owned scene's GPU resources before objects are removed from its tree. */
export class SceneResources {
  private readonly geometries = new Set<THREE.BufferGeometry>()
  private readonly materials = new Set<THREE.Material>()
  private readonly textures = new Set<THREE.Texture>()
  private readonly shadows = new Set<THREE.LightShadow>()

  constructor(root: THREE.Object3D) {
    root.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.geometry) this.geometries.add(mesh.geometry)
      for (const material of Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) {
        this.materials.add(material)
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) this.textures.add(value)
        if (material instanceof THREE.ShaderMaterial) {
          for (const uniform of Object.values(material.uniforms)) {
            for (const value of Array.isArray(uniform.value) ? uniform.value : [uniform.value]) if (value instanceof THREE.Texture) this.textures.add(value)
          }
        }
      }
      const shadow = (object as THREE.DirectionalLight).shadow
      if (shadow) this.shadows.add(shadow)
    })
    if (root instanceof THREE.Scene) {
      if (root.background instanceof THREE.Texture) this.textures.add(root.background)
      if (root.environment) this.textures.add(root.environment)
    }
  }

  dispose() {
    for (const geometry of this.geometries) geometry.dispose()
    for (const material of this.materials) material.dispose()
    for (const texture of this.textures) texture.dispose()
    for (const shadow of this.shadows) shadow.dispose()
    this.geometries.clear()
    this.materials.clear()
    this.textures.clear()
    this.shadows.clear()
  }
}
