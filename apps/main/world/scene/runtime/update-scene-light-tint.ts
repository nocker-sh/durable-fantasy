import { Color } from "three"
import { view } from "#/world/scene/actors"
import { litSprites } from "#/world/scene/gfx"
import { N } from "#/world/maps/ground/rules"
import type { DirectionalLight } from "three"
import type { SceneLight, SceneWaterUniforms } from "#/world/scene/runtime/scene-lighting-types"

type Props = Readonly<{ light: SceneLight; sun: DirectionalLight; water: SceneWaterUniforms }>

/** 自発光しない板絵にも時刻の色を掛け、水面は同じ空の色から明るくする。 */
export function updateSceneLightTint(props: Props): void {
  const light = props.light
  view.tint.set(light.tint)
  for (const material of litSprites) material.color.copy(view.tint)
  props.sun.position.set(N / 2 + Math.cos(light.azimuth) * 30 * Math.cos(light.elevation), Math.sin(light.elevation) * 30, N / 2 + Math.sin(light.azimuth) * 30 * Math.cos(light.elevation))
  props.water.sky.value.set(light.sky).lerp(new Color(0xffffff), 0.35)
}
