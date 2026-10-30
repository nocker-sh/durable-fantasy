import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"
type Props = Readonly<{ source: SpriteManifest; only: readonly string[] | null }>

export function getSpriteBakeSelection(props: Props): readonly number[] | Error {
  const only = props.only
  if (only === null) return props.source.residents.map((_resident, index) => index)
  if (!only.length || new Set(only).size !== only.length) return new Error("Sprite selection must contain distinct resident names")
  const selected = props.source.residents.flatMap((resident, index) => (only.includes(resident.name) ? [index] : []))
  if (selected.length !== only.length) return new Error("Sprite selection contains an unknown resident")
  return selected
}
