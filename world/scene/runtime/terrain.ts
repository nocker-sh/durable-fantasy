import type { CleanupStack } from "#/lib/engine/cleanup-stack"
import * as THREE from "three"
import { N, WATER_Y } from "#/world/scene/world"
import { INTERIORS } from "#/world/town/interiors"
import { meshHeights } from "#/world/scene/mesh-heights"
import { stoneTex } from "#/world/scene/textures/stone-tex"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { lap } from "#/world/lap"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { type SceneDefinition, MAP_SCENES } from "#/world/scene/runtime/definitions"

async function createTerrain(inputProps: { scene: THREE.Scene; world: SceneDefinition; ground: PixBuf; progress: (text: string) => void; tick: () => Promise<unknown>; resources: CleanupStack }) {
  const scene = inputProps.scene
  const world = inputProps.world
  const ground = inputProps.ground
  const progress = inputProps.progress
  const tick = inputProps.tick
  const resources = inputProps.resources

  const groundCanvas = document.createElement("canvas")
  groundCanvas.width = ground.w
  groundCanvas.height = ground.h
  groundCanvas.getContext("2d")!.putImageData(new ImageData(ground.data, ground.w, ground.h), 0, 0)
  if (world.indoor) {
    // the minimap of a room: dark all round, the floor where you can walk
    const g = groundCanvas.getContext("2d")!
    g.fillStyle = "#0c0a10"
    g.fillRect(0, 0, ground.w, ground.h)
    const it = INTERIORS.find((i) => MAP_SCENES[i.id] === world)!
    const k = ground.w / N
    g.fillStyle = "#6a4a32"
    g.fillRect(it.x0 * k, it.z0 * k, (it.x1 - it.x0) * k, (it.z1 - it.z0) * k)
    g.fillStyle = "#3a2618"
    for (const f of it.furniture) if (f.solid) g.fillRect((f.x - f.w / 2) * k, (f.z - f.d / 2) * k, f.w * k, f.d * k)
  }
  lap("scene: ground")
  progress("街を建てています…")
  await tick()
  const RES = 4,
    n = N * RES + 1
  const hs = meshHeights(RES)
  const pos = new Float32Array(n * n * 3),
    uv = new Float32Array(n * n * 2)
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const k = j * n + i
      pos[k * 3] = i / RES
      pos[k * 3 + 1] = hs[k]
      pos[k * 3 + 2] = j / RES
      uv[k * 2] = i / (n - 1)
      uv[k * 2 + 1] = 1 - j / (n - 1)
    }
  const idx: number[] = []
  for (let j = 0; j < n - 1; j++)
    for (let i = 0; i < n - 1; i++) {
      const a = j * n + i,
        b = a + 1,
        c = a + n,
        d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  const tg = resources.use(new THREE.BufferGeometry())
  tg.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  tg.setAttribute("uv", new THREE.BufferAttribute(uv, 2))
  tg.setIndex(idx)
  tg.computeVertexNormals()
  const gTex = resources.use(toTex(ground, false))
  gTex.minFilter = THREE.NearestFilter
  gTex.generateMipmaps = false
  const wallT = resources.use(toTex(stoneTex({ ramp: "stone", light: 0.5, seed: 21, bw: 20, bh: 11, size: 128 })))
  const tm = resources.use(new THREE.MeshLambertMaterial({ map: gTex }))
  tm.onBeforeCompile = (sh) => {
    sh.uniforms.wallMap = { value: wallT }
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWP; varying vec3 vWN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);")
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform sampler2D wallMap;").replace(
      "#include <map_fragment>",
      `
        vec4 gcol = texture2D(map, vMapUv);
        vec2 wuv = abs(vWN.x) > abs(vWN.z) ? vWP.zy : vWP.xy;
        vec4 wcol = texture2D(wallMap, wuv * 0.25);
        if (vWP.y < ${(WATER_Y + 0.05).toFixed(2)}) wcol.rgb *= vec3(0.62, 0.74, 0.7);
        diffuseColor *= vWN.y < 0.62 ? wcol : gcol;`,
    )
  }
  const terrain = new THREE.Mesh(tg, tm)
  terrain.receiveShadow = true
  terrain.castShadow = true
  scene.add(terrain)

  const wm = resources.use(
    new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { t: { value: 0 }, sky: { value: new THREE.Color(0xa6c2c2) } },
      vertexShader: "varying vec3 vP; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: `
      varying vec3 vP; uniform float t; uniform vec3 sky;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec2 p = floor(vP.xz * 32.0) / 32.0;
        float v = n(p * vec2(1.4, 0.7) + vec2(0.0, -t * 0.5)) * 0.6 + n(p * 3.1 + vec2(t * 0.2, -t * 0.9)) * 0.4;
        vec3 c0 = vec3(0.13,0.2,0.3), c1 = vec3(0.2,0.31,0.45), c2 = vec3(0.27,0.41,0.54), c3 = vec3(0.42,0.56,0.64);
        vec3 c = v < 0.42 ? c0 : v < 0.55 ? c1 : v < 0.7 ? c2 : c3;
        if (v > 0.78) c = sky;
        gl_FragColor = vec4(c, v > 0.78 ? 0.95 : 0.78);
        #include <colorspace_fragment>
      }`,
    }),
  )
  const water = new THREE.Mesh(resources.use(new THREE.PlaneGeometry(N, N)), wm)
  water.rotation.x = -Math.PI / 2
  water.position.set(N / 2, WATER_Y, N / 2)
  scene.add(water)

  if (world.indoor) {
    terrain.visible = false
    water.visible = false
  }
  return { groundCanvas, wm, terrain }
}

export { createTerrain }
