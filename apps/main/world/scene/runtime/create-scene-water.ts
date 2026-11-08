import { Color, Mesh, PlaneGeometry, ShaderMaterial } from "three"
import { N, WATER_Y } from "#/world/maps/ground/rules"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

const shaders = {
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
}

/** 水面の材質と平面を取得順に所有し、時刻と空の色の一様変数を照明へ渡す。 */
export function createSceneWater(resources: CleanupStack) {
  const uniforms = { t: { value: 0 }, sky: { value: new Color(0xa6c2c2) } }
  const material = resources.use(Object.assign(new ShaderMaterial({ transparent: true, uniforms, ...shaders }), { uniforms }))
  const water = new Mesh(resources.use(new PlaneGeometry(N, N)), material)
  water.rotation.x = -Math.PI / 2
  water.position.set(N / 2, WATER_Y, N / 2)
  return water
}
