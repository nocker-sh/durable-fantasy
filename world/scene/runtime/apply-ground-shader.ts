import { WATER_Y } from "#/world/scene/world"
import type { MeshLambertMaterial, Texture } from "three"

type Shader = Pick<Parameters<MeshLambertMaterial["onBeforeCompile"]>[0], "uniforms" | "vertexShader" | "fragmentShader">

const groundFragment = `
        vec4 gcol = texture2D(map, vMapUv);
        vec2 wuv = abs(vWN.x) > abs(vWN.z) ? vWP.zy : vWP.xy;
        vec4 wcol = texture2D(wallMap, wuv * 0.25);
        if (vWP.y < ${(WATER_Y + 0.05).toFixed(2)}) wcol.rgb *= vec3(0.62, 0.74, 0.7);
        diffuseColor *= vWN.y < 0.62 ? wcol : gcol;`

/** 傾いた面には石、上向きの面には地面の画素を使い、水際だけ石の色を変える。 */
export function applyGroundShader(shader: Shader, wall: Texture): void {
  shader.uniforms.wallMap = { value: wall }
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vWP; varying vec3 vWN;")
    .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);")
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform sampler2D wallMap;")
    .replace("#include <map_fragment>", groundFragment)
}
