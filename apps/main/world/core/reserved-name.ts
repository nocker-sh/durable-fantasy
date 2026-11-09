import { MAKERS } from "#/world/core/makers"
import { RENAMED_RESIDENTS } from "#/world/core/renamed-residents"
import { PEOPLE } from "#/world/town/people"

/**
 * 住民と作り手の名前と、改名した住民の以前の名前。プレイヤーが名乗ると住民になりすませ、作った品に住民の癖（makers.ts）が付いてしまう。
 * 以前の名前は、古い保存や取引所に残る住民の品の作り手として今の名前に読み替えるので、名乗った人の品も住民の品として読まれる。
 */
export function reservedName(name: string): boolean {
  return Object.hasOwn(MAKERS, name) || Object.hasOwn(PEOPLE, name) || Object.hasOwn(RENAMED_RESIDENTS, name)
}
