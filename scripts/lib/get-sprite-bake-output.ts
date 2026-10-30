import type { SpriteBakePlan } from "./sprite-bake-types"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"
type Props = Readonly<{ source: SpriteBakePlan["source"]; previous: SpriteManifest | null; selected: readonly number[]; partial: boolean }>

/** 作り直さない人の見た目と動作の記録は、既存の画像のまま保持する。 */
export function getSpriteBakeOutput(props: Props): SpriteBakePlan["output"] | Error {
  if (!props.partial) return props.source
  const previous = props.previous
  if (!previous || previous.rendererVersion !== props.source.rendererVersion || previous.frame.some((value, index) => value !== props.source.frame[index]))
    return new Error("Sprite renderer changed; run a complete bake before reusing strips")
  if (previous.residents.length !== props.source.residents.length || previous.residents.some((resident, index) => resident.name !== props.source.residents[index].name))
    return new Error("Resident indices changed; run a complete sprite bake")
  return {
    rendererVersion: props.source.rendererVersion,
    frame: props.source.frame,
    residents: props.source.residents.map((resident, index) => (props.selected.includes(index) ? resident : previous.residents[index])),
  }
}
