import { lines as smith } from "./households/smith"
import { lines as bakers } from "./households/bakers"
import { lines as well } from "./households/well"
import { lines as greengrocer } from "./households/greengrocer"
import { lines as fruit } from "./households/fruit"
import { lines as fisher } from "./households/fisher"
import { lines as farm } from "./households/farm"
import { lines as elder } from "./households/elder"
import { lines as inn } from "./households/inn"
import { lines as woodcutter } from "./households/woodcutter"
import { lines as shepherd } from "./households/shepherd"
import { lines as priest } from "./households/priest"
import { lines as carter } from "./households/carter"
import { lines as lamp } from "./households/lamp"
import type { Line } from "#/world/town/lines/line"

export const LINES: Record<string, readonly Line[]> = {
  ギュンター: smith["ギュンター"],
  ペーター: smith["ペーター"],
  マルタ: bakers["マルタ"],
  ハンス: bakers["ハンス"],
  リーゼル: well["リーゼル"],
  アンナ: greengrocer["アンナ"],
  クララ: fruit["クララ"],
  エルザ: fisher["エルザ"],
  オットー: fruit["オットー"],
  グレーテ: greengrocer["グレーテ"],
  ヤコブ: fisher["ヤコブ"],
  フリッツ: farm["フリッツ"],
  ミア: farm["ミア"],
  ヴィルヘルム: elder["ヴィルヘルム"],
  ゲルダ: inn["ゲルダ"],
  ヨーゼフ: woodcutter["ヨーゼフ"],
  ウルリケ: farm["ウルリケ"],
  カール: farm["カール"],
  マティアス: shepherd["マティアス"],
  ベネディクト: priest["ベネディクト"],
  ゾフィー: elder["ゾフィー"],
  ベルタ: carter["ベルタ"],
  ルカス: carter["ルカス"],
  ヘレナ: well["ヘレナ"],
  ローザ: bakers["ローザ"],
  ニーナ: inn["ニーナ"],
  ゼップ: inn["ゼップ"],
  ゲルトルート: farm["ゲルトルート"],
  ヴァルター: farm["ヴァルター"],
  クレメンス: priest["クレメンス"],
  パウル: fisher["パウル"],
  レナ: fisher["レナ"],
  ヨナス: fruit["ヨナス"],
  エミール: carter["エミール"],
  アウグスト: lamp["アウグスト"],
  ヘートヴィヒ: lamp["ヘートヴィヒ"],
  ティム: lamp["ティム"],
}
