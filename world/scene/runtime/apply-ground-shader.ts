import { WATER_Y } from "#/world/maps/ground/rules"
import type { MeshLambertMaterial, Texture } from "three"
import { skyUniforms } from "#/world/scene/runtime/sky-uniforms"
import { CLOUD_SHADE_GLSL } from "#/world/scene/runtime/cloud-shade-glsl"

type Shader = Pick<Parameters<MeshLambertMaterial["onBeforeCompile"]>[0], "uniforms" | "vertexShader" | "fragmentShader">

const groundFragment = `
        vec4 gcol = texture2D(map, vMapUv);
        vec2 wuv = abs(vWN.x) > abs(vWN.z) ? vWP.zy : vWP.xy;
        vec4 wcol = texture2D(wallMap, wuv * 0.25);
        if (vWP.y < ${(WATER_Y + 0.05).toFixed(2)}) wcol.rgb *= vec3(0.62, 0.74, 0.7);
        diffuseColor *= vWN.y < 0.62 ? wcol : gcol;
        diffuseColor.rgb *= cloudShade(vWP);`

/** 傾いた面には石、上向きの面には地面の画素を使い、水際だけ石の色を変える。 */
export function applyGroundShader(shader: Shader, wall: Texture): void {
  shader.uniforms.wallMap = { value: wall }
  shader.uniforms.cloudTime = skyUniforms.cloudTime
  shader.uniforms.cloud = skyUniforms.cloud
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vWP; varying vec3 vWN;")
    .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);")
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", `#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform sampler2D wallMap;\n${CLOUD_SHADE_GLSL}`)
    .replace("#include <map_fragment>", groundFragment)
}
