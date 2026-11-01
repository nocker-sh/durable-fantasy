import * as THREE from "three"
import { updaters } from "#/world/scene/construction/registry"

type Swaying = THREE.Material & { userData: { swayTime?: { value: number } } }

/**
 * Let a plant's material bend in the wind: the higher a vertex stands, the further it leans, each
 * instance a little out of step with its neighbours. Patched into the shader once; every map that
 * builds the plant hooks its clock to the frame again (the updaters are emptied between maps).
 */
export function sway(material: THREE.Material, amp: number): THREE.Material {
  const m = material as Swaying
  if (!m.userData.swayTime) {
    const time = { value: 0 }
    m.userData.swayTime = time
    const before = m.onBeforeCompile
    m.onBeforeCompile = (shader, renderer) => {
      before?.call(m, shader, renderer)
      shader.uniforms.swayTime = time
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float swayTime;").replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        {
          vec2 at = vec2(0.0);
          #ifdef USE_INSTANCING
            at = instanceMatrix[3].xz;
          #endif
          float gust = sin(swayTime * 0.45 + at.x * 0.11 + at.y * 0.05) * 0.5 + 0.7;
          float lean = sin(swayTime * 1.7 + at.x * 0.9 + at.y * 0.6) * gust;
          float up = max(0.0, position.y);
          transformed.x += lean * ${amp.toFixed(3)} * up * up;
          transformed.z += lean * ${(amp * 0.4).toFixed(3)} * up * up;
        }`,
      )
    }
    m.needsUpdate = true
  }
  const time = m.userData.swayTime
  updaters.push((t) => {
    time.value = t
  })
  return m
}
