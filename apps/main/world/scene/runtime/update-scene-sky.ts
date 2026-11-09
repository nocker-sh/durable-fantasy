import { Color, Fog } from "three"
import type { Scene } from "three"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"

type Props = Readonly<{ scene: Scene; world: SceneDefinition; sky: number; daylight: number }>

/** 屋内は暗い背景だけを使い、霧のある屋外では背景と霧の色を揃える。 */
export function updateSceneSky(props: Props): void {
  props.scene.background = new Color(props.world.indoor ? 0x0c0a10 : props.sky)
  if (props.world.indoor) {
    props.scene.fog = null
    return
  }
  const fog = props.world.layout.fog
  if (!fog) {
    props.scene.fog = new Fog(props.sky, 30, 60)
    return
  }
  const color = new Color(fog.color).lerp(new Color(props.sky), 0.35 + (1 - props.daylight) * 0.5)
  props.scene.fog = new Fog(color, fog.near, fog.far)
  props.scene.background = props.scene.fog.color.clone()
}
