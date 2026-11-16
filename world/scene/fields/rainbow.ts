import * as THREE from "three"
import { groundH } from "#/world/scene/ground-h"
import { skyUniforms } from "#/world/scene/runtime/sky-uniforms"

const bowGeo = new THREE.RingGeometry(0.82, 1, 40, 1, 0, Math.PI)

const bowMat = new THREE.ShaderMaterial({
  uniforms: { time: skyUniforms.cloudTime, sun: skyUniforms.sun },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    uniform float time; uniform float sun; varying vec2 vP;
    void main(){
      float band = (length(vP) - 0.82) / 0.18;
      if (band < 0.0 || band >= 1.0) discard;
      int i = int(floor(band * 6.0));
      vec3 c = i == 0 ? vec3(0.56, 0.42, 0.86) : i == 1 ? vec3(0.36, 0.56, 0.95) : i == 2 ? vec3(0.42, 0.84, 0.6) : i == 3 ? vec3(0.95, 0.9, 0.46) : i == 4 ? vec3(0.98, 0.66, 0.36) : vec3(0.94, 0.42, 0.42);
      // strongest over the water, gone at its feet; it comes and goes with the spray
      float a = smoothstep(0.02, 0.5, vP.y) * (0.7 + 0.3 * sin(time * 0.35)) * sun;
      vec2 px = floor(gl_FragCoord.xy);
      float dither = fract(sin(dot(px, vec2(12.9898, 78.233))) * 43758.5453);
      if (a < 0.15 + dither * 0.35) discard;
      gl_FragColor = vec4(c * a * 0.36, 1.0);
    }`,
})

/**
 * The bow that stands in the spray of a fall when the sun gets through the ash (landscape.md
 * 「動くものと光」). It turns to face whoever looks at it, as a rainbow does, and is gone at night.
 */
export function rainbow(root: THREE.Group, at: readonly [number, number], radius: number) {
  const bow = new THREE.Mesh(bowGeo, bowMat)
  bow.position.set(at[0], groundH(at[0], at[1]) - 0.4, at[1])
  bow.scale.set(radius, radius, 1)
  bow.rotation.y = Math.PI / 4
  bow.renderOrder = 4
  bow.frustumCulled = false
  bow.onBeforeRender = (_renderer, _scene, camera) => {
    bow.rotation.y = Math.atan2(camera.position.x - bow.position.x, camera.position.z - bow.position.z)
  }
  root.add(bow)
}
