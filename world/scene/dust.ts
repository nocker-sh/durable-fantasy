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
