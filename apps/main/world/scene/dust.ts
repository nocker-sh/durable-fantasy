import * as THREE from "three"
const ASH = new THREE.Color(0x9c9890)

/**
 * Settle ash on a material's upward faces. Done once per material, in its shader: the colour is
 * mixed towards ash by how much the face looks up, in soft drifts so it lies in patches.
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
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vAshN;
varying vec3 vAshP;
uniform vec3 ashColor;
uniform float ashAmount;
float ashHash(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
float ashNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(ashHash(i), ashHash(i + vec2(1.0, 0.0)), f.x), mix(ashHash(i + vec2(0.0, 1.0)), ashHash(i + vec2(1.0, 1.0)), f.x), f.y);
}`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        {
          // a thin film everywhere, patches and deeper drifts where a
          // broad soft noise rises, in two or three flat tones whose edges are broken at the size
          // of a dot of the ground (32 to a unit), so it lies in drifts rather than as random blocks
          vec2 ashQ = vAshP.xz + vAshP.y * 0.37;
          vec2 ashTexel = floor(ashQ * 32.0);
          vec2 ashS = ashTexel / 32.0;
          float drift = ashNoise(ashS * 0.9) * 0.65 + ashNoise(ashS * 3.1 + 17.0) * 0.35;
          drift += (ashHash(ashTexel) - 0.5) * 0.16;
          float up = smoothstep(0.35, 0.85, vAshN.y);
          float k = up * ashAmount * (drift > 0.6 ? 0.7 : drift > 0.47 ? 0.42 : 0.18);
          diffuseColor.rgb = mix(diffuseColor.rgb, ashColor, clamp(k, 0.0, 0.8));
        }`,
      )
  }
  m.needsUpdate = true
}
