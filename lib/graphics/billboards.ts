import * as THREE from "three"

/** Camera-facing transparent quads sharing one texture and one draw call. */
export class BillboardBatch {
  readonly mesh: THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>
  private readonly viewMatrix = new THREE.Matrix4()
  private readonly centers: Float32Array
  private readonly sizes: Float32Array
  private readonly opacities: Float32Array
  private readonly order: number[]
  private readonly depths: Float32Array
  private readonly offsets: THREE.InstancedBufferAttribute
  private readonly scales: THREE.InstancedBufferAttribute
  private readonly alphas: THREE.InstancedBufferAttribute

  constructor(
    texture: THREE.Texture,
    readonly count: number,
  ) {
    this.centers = new Float32Array(count * 3)
    this.sizes = new Float32Array(count)
    this.opacities = new Float32Array(count)
    this.depths = new Float32Array(count)
    this.order = Array.from({ length: count }, (_, i) => i)
    const geometry = new THREE.InstancedBufferGeometry()
    const plane = new THREE.PlaneGeometry(1, 1)
    geometry.index = plane.index
    geometry.attributes = plane.attributes
    geometry.instanceCount = count
    this.offsets = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage)
    this.scales = new THREE.InstancedBufferAttribute(new Float32Array(count), 1).setUsage(THREE.DynamicDrawUsage)
    this.alphas = new THREE.InstancedBufferAttribute(new Float32Array(count), 1).setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute("offset", this.offsets)
    geometry.setAttribute("size", this.scales)
    geometry.setAttribute("alpha", this.alphas)
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: true,
      uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), map: { value: texture } },
      vertexShader: `
        attribute vec3 offset;
        attribute float size, alpha;
        varying vec2 vUv;
        varying float vAlpha;
        #include <fog_pars_vertex>
        void main() {
          vUv = uv;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(offset, 1.0);
          mvPosition.xy += position.xy * size;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;
        varying float vAlpha;
        #include <fog_pars_fragment>
        void main() {
          gl_FragColor = texture2D(map, vUv);
          gl_FragColor.a *= vAlpha;
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.frustumCulled = false
  }

  set(index: number, x: number, y: number, z: number, size: number, opacity: number) {
    this.centers[index * 3] = x
    this.centers[index * 3 + 1] = y
    this.centers[index * 3 + 2] = z
    this.sizes[index] = size
    this.opacities[index] = opacity
  }

  /** Call after moving the camera, before rendering (before Three uploads attributes). */
  prepare(camera: THREE.Camera) {
    camera.updateWorldMatrix(true, false)
    this.mesh.updateWorldMatrix(true, false)
    const e = this.viewMatrix.multiplyMatrices(camera.matrixWorldInverse, this.mesh.matrixWorld).elements
    for (let i = 0; i < this.count; i++) this.depths[i] = e[2] * this.centers[i * 3] + e[6] * this.centers[i * 3 + 1] + e[10] * this.centers[i * 3 + 2]
    this.order.sort((a, b) => this.depths[a] - this.depths[b] || a - b)
    for (let i = 0; i < this.count; i++) {
      const k = this.order[i]
      this.offsets.setXYZ(i, this.centers[k * 3], this.centers[k * 3 + 1], this.centers[k * 3 + 2])
      this.scales.setX(i, this.sizes[k])
      this.alphas.setX(i, this.opacities[k])
    }
    this.offsets.needsUpdate = this.scales.needsUpdate = this.alphas.needsUpdate = true
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
