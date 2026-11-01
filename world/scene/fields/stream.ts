import * as THREE from "three"
import { groundH } from "#/world/scene/ground-h"
import { updaters } from "#/world/scene/construction/registry"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"

const shaders = {
  vertexShader: `
    #include <common>
    #include <fog_pars_vertex>
    attribute float fall;
    varying float vFall;
    varying vec2 vUv;
    void main(){
      vUv = uv; vFall = fall;
      vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    #include <common>
    #include <fog_pars_fragment>
    uniform float t; uniform float light;
    varying float vFall;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
    void main(){
      // in texel-sized steps, so the water stays pixel art; it runs down the ribbon, fast over the falls
      vec2 p = floor(vec2(vUv.x * 10.0, vUv.y * 16.0)) / vec2(10.0, 16.0);
      float speed = 1.2 + vFall * 4.5;
      float v = n(vec2(p.x * 3.0, p.y * 1.3 - t * speed)) * 0.6 + n(vec2(p.x * 7.0, p.y * 3.0 - t * speed * 1.4)) * 0.4;
      float edge = abs(vUv.x - 0.5) * 2.0;
      vec3 c0 = vec3(0.13,0.2,0.3), c1 = vec3(0.2,0.31,0.45), c2 = vec3(0.3,0.44,0.56), c3 = vec3(0.42,0.56,0.64), foam = vec3(0.76,0.84,0.86);
      vec3 c = v < 0.4 ? c0 : v < 0.54 ? c1 : v < 0.66 ? c2 : c3;
      // white water over the falls and where the stream breaks on its stones at the edges
      if (v > 0.8 - vFall * 0.6 || (edge > 0.84 && v > 0.62)) c = foam;
      gl_FragColor = vec4(c * light, 0.92);
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
}

/**
 * Running water drawn on the ground along a path: a ribbon a little above the cut bed, its texture
 * flowing downstream and breaking white where the ground drops (the falls). It is only drawn; the
 * bed itself is cut by the map's ground height, and the walk grid keeps people out of it.
 * Returns the foot of each fall, where the water lands.
 */
export function stream(root: THREE.Group, pts: readonly Vector2Tuple[], width: (along: number) => number): Vector2Tuple[] {
  const pos: number[] = [],
    uv: number[] = [],
    fall: number[] = [],
    index: number[] = []
  const step = 0.2
  const total = { value: 0 }
  const samples: { x: number; z: number; nx: number; nz: number; s: number }[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i],
      b = pts[i + 1]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    for (let d = 0; d < len; d += step) {
      const k = d / len
      samples.push({ x: a[0] + (b[0] - a[0]) * k, z: a[1] + (b[1] - a[1]) * k, nx: -(b[1] - a[1]) / len, nz: (b[0] - a[0]) / len, s: total.value + d })
    }
    total.value += len
  }
  const last = pts[pts.length - 1]
  samples.push({ x: last[0], z: last[1], nx: samples[samples.length - 1].nx, nz: samples[samples.length - 1].nz, s: total.value })
  // smooth the normals so the ribbon bends round its corners instead of folding
  const ys = samples.map((s) => groundH(s.x, s.z) + 0.07)
  samples.forEach((s, i) => {
    const w = width(s.s / total.value) / 2
    const prev = ys[Math.max(0, i - 2)]
    const drop = Math.min(1, Math.max(0, (prev - ys[i]) * 3))
    for (const side of [-1, 1]) {
      const x = s.x + s.nx * w * side,
        z = s.z + s.nz * w * side
      pos.push(x, Math.max(ys[i], groundH(x, z) + 0.03), z)
      uv.push(side < 0 ? 0 : 1, s.s)
      fall.push(drop)
    }
    if (i > 0) {
      const o = (i - 1) * 2
      index.push(o, o + 2, o + 1, o + 1, o + 2, o + 3)
    }
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  geo.setAttribute("fall", new THREE.Float32BufferAttribute(fall, 1))
  geo.setIndex(index)
  const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { t: { value: 0 }, light: { value: 1 } }])
  const material = new THREE.ShaderMaterial({ uniforms, transparent: true, fog: true, side: THREE.DoubleSide, ...shaders })
  const mesh = new THREE.Mesh(geo, material)
  mesh.renderOrder = 1
  root.add(mesh)
  updaters.push((t) => {
    uniforms.t.value = t
  })
  // the foot of each fall: the first place below a steep run where the water levels out again
  const feet: Vector2Tuple[] = []
  const falling = { value: false }
  ys.forEach((y, i) => {
    const drop = (ys[Math.max(0, i - 2)] - y) * 3
    if (drop > 0.5) falling.value = true
    else if (falling.value && drop < 0.15) {
      falling.value = false
      feet.push([samples[i].x, samples[i].z])
    }
  })
  return feet
}
