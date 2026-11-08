import { MAKERS } from "#/world/core/makers"
import { PEOPLE } from "#/world/town/people"

/** 住民と作り手の名前。プレイヤーが名乗ると住民になりすませ、作った品に住民の癖（makers.ts）が付いてしまう。 */
export function reservedName(name: string): boolean {
  return Object.hasOwn(MAKERS, name) || Object.hasOwn(PEOPLE, name)
}
