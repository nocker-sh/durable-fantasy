import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"

/** 人物の順序はファイル名の一部だが、動作の辞書の挿入順には依存しない。 */
export function areSpriteManifestsEqual(first: SpriteManifest, second: SpriteManifest): boolean {
  if (first.rendererVersion !== second.rendererVersion || first.frame.some((value, index) => value !== second.frame[index]) || first.residents.length !== second.residents.length) return false
  return first.residents.every((resident, index) => {
    const other = second.residents[index]
    return (
      resident.name === other.name &&
      resident.key === other.key &&
      Object.keys(resident.anims).length === Object.keys(other.anims).length &&
      Object.entries(resident.anims).every((animation) => other.anims[animation[0]] === animation[1])
    )
  })
}
