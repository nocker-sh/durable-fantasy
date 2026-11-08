import { Fog } from "three"
import type { Scene } from "three"
import type { Layout } from "#/world/maps/layout-types"

type Props = Readonly<{ scene: Pick<Scene, "fog">; distance: number; definition: Layout["fog"] }>

/** カメラと人物の間隔を足し、霧の開始と終端を人物からの距離に保つ。 */
export function updateSceneFog(props: Props): void {
  if (!props.definition || !(props.scene.fog instanceof Fog)) return
  props.scene.fog.near = props.distance + props.definition.near
  props.scene.fog.far = props.distance + props.definition.far
}
