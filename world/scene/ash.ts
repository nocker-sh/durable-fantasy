// Ash from the dead world tree, everywhere and always (world.md「気候と灰」): fine grey grains drifting down round the
// player, and a dusting of it on everything that faces the sky — roofs, eaves, sills, the lids of
// barrels, the rails of fences — thicker on flat tops, broken up so it never looks painted on.
import * as THREE from "three"

const ASH = new THREE.Color(0x9c9890)

/**
 * Settle ash on a material's upward faces. Done once per material, in its shader: the colour is
 * mixed towards ash by how much the face looks up, with a blocky noise so it lies in patches.
 */
export function dust(material: THREE.Material, amount = 1) {
  const m = material as THREE.Material & { userData: { ash?: boolean } }
  if (m.userData.ash || !(m instanceof THREE.MeshLambertMaterial || m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhongMaterial)) return
  m.userData.ash = true
  const before = m.onBeforeCompile
  m.onBeforeCompile = (shader, renderer) => {
    before?.call(m, shader, renderer)
    shader.uniforms.ashColor = { value: ASH }
    shader.uniforms.ashAmount = { value: amount }
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vAshN;\nvarying vec3 vAshP;").replace(
      "#include <project_vertex>",
      `#include <project_vertex>
        vAshN = normalize(inverseTransformDirection(transformedNormal, viewMatrix));
        vec4 ashP = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          ashP = instanceMatrix * ashP;
        #endif
        vAshP = (modelMatrix * ashP).xyz;`,
    )
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vAshN;\nvarying vec3 vAshP;\nuniform vec3 ashColor;\nuniform float ashAmount;").replace(
      "#include <map_fragment>",
      `#include <map_fragment>
        {
          // in texel-sized blocks, so it stays pixel art
          vec2 cell = floor(vAshP.xz * 16.0 + vAshP.y * 7.0);
          float n = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
          float up = smoothstep(0.45, 0.92, vAshN.y);
          float k = up * ashAmount * (n > 0.35 ? 0.55 + 0.35 * n : 0.12);
          diffuseColor.rgb = mix(diffuseColor.rgb, ashColor, clamp(k, 0.0, 0.85));
        }`,
    )
  }
  m.needsUpdate = true
}

/** Dust everything built in a scene, except what `skip` says (the ground, which is painted with its own ash). */
export function dustAll(root: THREE.Object3D, skip: (o: THREE.Object3D) => boolean) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh || skip(o)) return
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) if (!m.transparent) dust(m)
  })
}

/** Ash falling round a point: a box of grains that follows the camera's focus and drifts down slowly. */
export class Ashfall {
  readonly points: THREE.Points
  private v: Float32Array
  private readonly size = 22
  constructor(count = 1600) {
    const pos = new Float32Array(count * 3)
    this.v = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * this.size
      pos[i * 3 + 1] = Math.random() * 9
      pos[i * 3 + 2] = (Math.random() - 0.5) * this.size
      this.v[i] = 0.25 + Math.random() * 0.35
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xb8b4ac, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false })
    this.points = new THREE.Points(geo, mat)
    this.points.frustumCulled = false
    this.points.renderOrder = 5
  }

  /** Move the grains on; `focus` is where the camera looks, `night` from 0 (day) to 1 (night). */
  update(dt: number, t: number, focus: THREE.Vector3, night: number) {
    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute
    const a = pos.array as Float32Array,
      h = this.size / 2
    for (let i = 0; i < this.v.length; i++) {
      a[i * 3 + 1] -= this.v[i] * dt
      a[i * 3] += Math.sin(t * 0.4 + i) * 0.08 * dt + 0.05 * dt
      a[i * 3 + 2] += Math.cos(t * 0.3 + i * 1.7) * 0.06 * dt
      if (a[i * 3 + 1] < -1) {
        a[i * 3 + 1] = 8 + Math.random()
        a[i * 3] = (Math.random() - 0.5) * this.size
        a[i * 3 + 2] = (Math.random() - 0.5) * this.size
      }
      if (a[i * 3] > h) a[i * 3] -= this.size
    }
    pos.needsUpdate = true
    this.points.position.set(focus.x, focus.y - 1, focus.z)
    const m = this.points.material as THREE.PointsMaterial
    // by day grey grains against the haze; by night only those near a light are seen, faintly warm
    m.color.setHex(night > 0.5 ? 0xc8b8a0 : 0xb8b4ac)
    m.opacity = 0.55 - night * 0.25
  }
}
