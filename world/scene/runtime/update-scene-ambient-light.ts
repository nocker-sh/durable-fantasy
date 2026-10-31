import { glowMats } from "#/world/scene/construction/registry"
import { updateSceneSky } from "#/world/scene/runtime/update-scene-sky"
import type { Scene } from "three"
import type { SceneEnvironment } from "#/world/scene/runtime/scene-environment-types"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"
import type { SceneLight } from "#/world/scene/runtime/scene-lighting-types"

type Props = Readonly<{ scene: Scene; world: SceneDefinition; environment: Pick<SceneEnvironment, "hemi" | "sun">; light: SceneLight; daylight: number }>

/** 屋内は窓からの日差しだけを残し、環境光と外の明るさを示す窓を同期する。 */
export function updateSceneAmbientLight(props: Props): void {
  const sun = props.environment.sun
  const hemi = props.environment.hemi
  sun.color.set(props.light.sun)
  sun.intensity = props.world.indoor ? props.light.sunIntensity * 0.25 : props.light.sunIntensity
  hemi.color.set(props.light.hemi)
  hemi.groundColor.set(props.light.groundColor)
  hemi.intensity = props.light.hemisphereIntensity
  updateSceneSky({ scene: props.scene, world: props.world, sky: props.light.sky, daylight: props.daylight })
  if (props.world.indoor) {
    sun.color.set(0xffe8c8)
    hemi.color.set(0xffe2c0)
    hemi.groundColor.set(0x3a2c28)
    hemi.intensity = 0.75 + props.light.hemisphereIntensity * 0.15
  }
  glowMats.forEach((material) => {
    material.emissiveIntensity = props.world.indoor ? 0.15 + props.daylight * 0.9 : props.light.glow
  })
}
