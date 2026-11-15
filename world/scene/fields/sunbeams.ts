import * as THREE from "three"
import { groundH } from "#/world/scene/ground-h"
import { skyUniforms } from "#/world/scene/runtime/sky-uniforms"

/**
 * Light breaking through the ash haze in a beam onto a place worth stopping at (landscape.md
 * 「何を美しいとするか」: where the ash thins at noon and the sun comes through a gap in the cloud,
 * that is where the view is). Each beam is a pair of crossed planes leaning away from the sun,
 * bright at the foot and fading upwards and to its edges in stepped, dithered pixels. They wax and
 * wane slowly, each out of step with the others, as the haze drifts; at night there are none.
 */
const beamGeo = (() => {
  const a = new THREE.PlaneGeometry(1, 1, 1, 1).translate(0, 0.5, 0)
  const b = a.clone().rotateY(Math.PI / 2)
  const parts = [a, b].map((g) => g.toNonIndexed())
  const g = new THREE.BufferGeometry()
  for (const name of ["position", "uv"]) {
    const arrays = parts.map((p) => Array.from(p.attributes[name].array))
    g.setAttribute(name, new THREE.Float32BufferAttribute(arrays.flat(), name === "uv" ? 2 : 3))
  }
  return g
})()

const beamMat = new THREE.ShaderMaterial({
  uniforms: { time: skyUniforms.cloudTime, sun: skyUniforms.sun },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  vertexShader: `
    attribute float seed; varying vec2 vUv; varying float vSeed;
    void main(){ vUv = uv; vSeed = seed; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform float time; uniform float sun; varying vec2 vUv; varying float vSeed;
    void main(){
      float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
      float a = pow(across, 1.6) * pow(1.0 - vUv.y, 1.3);
      a *= (0.55 + 0.45 * sin(time * 0.13 + vSeed * 6.3)) * sun;
      // stepped and dithered, so the beam reads as pixels, not a smooth gradient
      vec2 px = floor(gl_FragCoord.xy);
      float dither = fract(sin(dot(px, vec2(12.9898, 78.233))) * 43758.5453) * 0.08;
      a = floor((a + dither) * 5.0) / 5.0;
      if (a <= 0.0) discard;
      gl_FragColor = vec4(vec3(1.0, 0.9, 0.68) * a * 0.32, 1.0);
    }`,
})

/** Beams at [x, z, width]: where the light falls, and how wide the gap in the haze is. */
export function sunbeams(root: THREE.Group, at: readonly (readonly [number, number, number])[]) {
  if (!at.length) return
  const geo = beamGeo.clone()
  geo.setAttribute("seed", new THREE.InstancedBufferAttribute(new Float32Array(at.map((_, i) => (i * 0.37) % 1)), 1))
  const im = new THREE.InstancedMesh(geo, beamMat, at.length)
  const m4 = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    e = new THREE.Euler()
  at.forEach(([x, z, w], i) => {
    // leaning away from the sun, which stands to the south-east of the fields by day
    q.setFromEuler(e.set(0.32, 0.6, 0.18, "YXZ"))
    m4.compose(new THREE.Vector3(x, groundH(x, z) - 0.2, z), q, new THREE.Vector3(w, 9, w))
    im.setMatrixAt(i, m4)
  })
  im.castShadow = false
  im.receiveShadow = false
  im.renderOrder = 4
  im.frustumCulled = false
  root.add(im)
}
