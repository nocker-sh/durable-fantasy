import { daylight } from "#/world/core/daylight"
import { lamps } from "#/world/scene/construction/registry"
import { HOUSES } from "#/world/town/houses"
import { getSceneLight } from "#/world/scene/runtime/get-scene-light"
import { SceneHouseLights } from "#/world/scene/runtime/scene-house-lights"
import { updateSceneAmbientLight } from "#/world/scene/runtime/update-scene-ambient-light"
import { updateSceneLightTint } from "#/world/scene/runtime/update-scene-light-tint"
import { updateSceneFlames } from "#/world/scene/runtime/update-scene-flames"
import { updateSceneLamps } from "#/world/scene/runtime/update-scene-lamps"
import { updateSceneSmoke } from "#/world/scene/runtime/update-scene-smoke"
import type { Scene } from "three"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"
import type { SceneEnvironment } from "#/world/scene/runtime/scene-environment-types"
import type { SceneWaterUniforms } from "#/world/scene/runtime/scene-lighting-types"

type Props = Readonly<{ scene: Scene; world: SceneDefinition; wm: { uniforms: SceneWaterUniforms }; applySchedule(minute: number): void; environment: SceneEnvironment }>

/** 日課の反映後に部屋の灯りを決め、フレームでは火・街灯・煙・水面の順で動かす。 */
export class SceneLighting {
  private readonly clock = { minute: 12 * 60, light: getSceneLight(12 * 60) }
  private readonly lampOrder = [...lamps].sort((a, b) => a.x + a.z * 0.3 - (b.x + b.z * 0.3))
  private readonly houses = new SceneHouseLights({ houses: HOUSES })

  constructor(private readonly props: Props) {
    Object.freeze(this)
    this.setClock(this.clock.minute)
  }

  readonly setClock = (minute: number): void => {
    this.clock.minute = ((minute % 1440) + 1440) % 1440
    const brightness = daylight(this.clock.minute)
    const light = (this.clock.light = getSceneLight(this.clock.minute))
    updateSceneAmbientLight({ ...this.props, light, daylight: brightness })
    this.props.applySchedule(this.clock.minute)
    this.houses.update(this.clock.minute, brightness)
    updateSceneLightTint({ light, sun: this.props.environment.sun, water: this.props.wm.uniforms })
  }

  readonly setTod = (index: number): void => {
    this.setClock([12 * 60, 16 * 60 + 45, 22 * 60][((index % 3) + 3) % 3])
  }

  readonly animate = (dt: number, time: number): void => {
    updateSceneFlames(time, this.clock.light.night, this.houses)
    updateSceneLamps(this.lampOrder, this.clock.minute, time)
    updateSceneSmoke({ environment: this.props.environment, dt })
    this.props.wm.uniforms.t.value = time
  }

  get minutes(): number {
    return this.clock.minute
  }
}
