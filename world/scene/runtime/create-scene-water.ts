import { Color, DataTexture, Mesh, PlaneGeometry, RedFormat, ShaderMaterial } from "three"
import type { Texture } from "three"
import { N, WATER_Y } from "#/world/maps/ground/rules"
import { skyUniforms } from "#/world/scene/runtime/sky-uniforms"
import { CLOUD_SHADE_GLSL } from "#/world/scene/runtime/cloud-shade-glsl"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

// The water in pixels: four tones of blue moving in slow bands, paler and greener where it is
// shallow, darker where it is deep; foam lapping in lines along the shore, the sky caught in
// the crests, and the sun (or, at night, the moon) glinting on single pixels. The whole of it is
// lit by the time of day's tint, so it darkens with the land at night instead of glowing.
const shaders = {
  vertexShader: "varying vec3 vP; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
  fragmentShader: `
      varying vec3 vP; uniform float t; uniform vec3 sky; uniform vec3 tint; uniform float day; uniform sampler2D depthMap;
      ${CLOUD_SHADE_GLSL}
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec2 p = floor(vP.xz * 32.0) / 32.0;
        float d = texture2D(depthMap, (p + 1.0 / 64.0) / ${N.toFixed(1)}).r;
        float deep = smoothstep(0.02, 0.75, d);
        float v = n(p * vec2(0.9, 2.4) + vec2(t * 0.08, -t * 0.45)) * 0.6 + n(p * vec2(2.2, 5.2) + vec2(t * 0.2, -t * 0.9)) * 0.4;
        vec3 c0 = vec3(0.12,0.19,0.29), c1 = vec3(0.18,0.29,0.43), c2 = vec3(0.25,0.39,0.52), c3 = vec3(0.4,0.54,0.62);
        vec3 s0 = vec3(0.2,0.31,0.33), s1 = vec3(0.27,0.4,0.4), s2 = vec3(0.34,0.48,0.47);
        float b = v - (1.0 - deep) * 0.06;
        vec3 c = b < 0.42 ? mix(s0, c0, deep) : b < 0.55 ? mix(s1, c1, deep) : b < 0.7 ? mix(s2, c2, deep) : c3;
        float a = mix(0.62, 0.86, deep);
        if (v > 0.8) { c = mix(c3, sky, 0.7); a = 0.95; }
        // foam: a line hugging the shore, and wavelets running in towards it now and then
        float wob = n(p * 2.2 + vec2(t * 0.15, 0.0)) * 0.05;
        float lap = sin((d + wob) * 70.0 - t * 1.6);
        if (d < 0.035 + wob * 0.4 || (d < 0.16 && lap > 0.86 - d * 1.5 && h(floor(p * 16.0)) > 0.25)) { c = mix(c, vec3(0.86, 0.9, 0.9), 0.85); a = 0.92; }
        // glints: a single pixel catching the light for a moment, more of them by day
        vec2 cell = floor(vP.xz * 16.0);
        float g = h(cell + floor(t * 1.3 + h(cell) * 7.0) * 0.137);
        if (deep > 0.15 && g > 0.997 - day * 0.004) { c = mix(sky, vec3(1.0), 0.75); a = 1.0; }
        gl_FragColor = vec4(c * tint * mix(0.62, 1.0, day) * cloudShade(vP), a);
        #include <colorspace_fragment>
      }`,
}

/** 水面の材質と平面を取得順に所有し、時刻・空の色・明るさの一様変数と水深を照明へ渡す。 */
export function createSceneWater(resources: CleanupStack, depth?: Texture) {
  const depthMap = resources.use(depth ?? Object.assign(new DataTexture(new Uint8Array([255]), 1, 1, RedFormat), { needsUpdate: true }))
  const uniforms = {
    t: { value: 0 },
    sky: { value: new Color(0xa6c2c2) },
    tint: { value: new Color(0xffffff) },
    day: { value: 1 },
    depthMap: { value: depthMap },
    cloudTime: skyUniforms.cloudTime,
    cloud: skyUniforms.cloud,
  }
  const material = resources.use(Object.assign(new ShaderMaterial({ transparent: true, uniforms, ...shaders }), { uniforms }))
  const water = new Mesh(resources.use(new PlaneGeometry(N, N)), material)
  water.rotation.x = -Math.PI / 2
  water.position.set(N / 2, WATER_Y, N / 2)
  return water
}
