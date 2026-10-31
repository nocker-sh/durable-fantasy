import { createResidentLooks } from "#/world/town/create-resident-looks"
import { residents as smith } from "#/world/town/residents/smith"
import { residents as bakers } from "#/world/town/residents/bakers"
import { residents as well } from "#/world/town/residents/well"
import { residents as greengrocer } from "#/world/town/residents/greengrocer"
import { residents as fruit } from "#/world/town/residents/fruit"
import { residents as fisher } from "#/world/town/residents/fisher"
import { residents as farm } from "#/world/town/residents/farm"
import { residents as elder } from "#/world/town/residents/elder"
import { residents as inn } from "#/world/town/residents/inn"
import { residents as woodcutter } from "#/world/town/residents/woodcutter"
import { residents as shepherd } from "#/world/town/residents/shepherd"
import { residents as priest } from "#/world/town/residents/priest"
import { residents as guards } from "#/world/town/residents/guards"
import { residents as carter } from "#/world/town/residents/carter"
import { residents as tavern } from "#/world/town/residents/tavern"
import { residents as apothecary } from "#/world/town/residents/apothecary"
import { residents as general } from "#/world/town/residents/general"
import { residents as tailor } from "#/world/town/residents/tailor"
import { residents as crystal } from "#/world/town/residents/crystal"
import { residents as buyer } from "#/world/town/residents/buyer"
import { residents as armorer } from "#/world/town/residents/armorer"
import { residents as woodworker } from "#/world/town/residents/woodworker"
import { residents as leather } from "#/world/town/residents/leather"
import { residents as guide } from "#/world/town/residents/guide"
import { residents as warehouse } from "#/world/town/residents/warehouse"
import { residents as lamp } from "#/world/town/residents/lamp"
import { residents as mapmaker } from "#/world/town/residents/mapmaker"
import { residents as scribe } from "#/world/town/residents/scribe"
import { residents as candle } from "#/world/town/residents/candle"
import { residents as potter } from "#/world/town/residents/potter"
import { residents as baskets } from "#/world/town/residents/baskets"
import { residents as mason } from "#/world/town/residents/mason"
import { residents as sweep } from "#/world/town/residents/sweep"
import { residents as tinker } from "#/world/town/residents/tinker"
import { residents as hunter } from "#/world/town/residents/hunter"
import { residents as teacher } from "#/world/town/residents/teacher"
import { residents as retired } from "#/world/town/residents/retired"

// Residents of the town: who they are, how they look and where they stand. What they say is in
// lines/, who they are as people in people.ts, their day in routines.ts.
import type { Look } from "#/world/scene/figure/look"
import type { Anim } from "#/world/scene/figure/animation"
import { keeperPlace } from "#/world/town/keeper-place"

type V2 = [number, number]

/** A resident: who they are, how they look, which map and spot they stand on. */
export type { Resident } from "#/world/town/resident"
import type { Resident } from "#/world/town/resident"

import { residents as r_miller } from "#/world/town/residents/miller"
import { residents as r_tenant_a } from "#/world/town/residents/tenant-a"
import { residents as r_tenant_b } from "#/world/town/residents/tenant-b"
import { residents as r_butcher } from "#/world/town/residents/butcher"
import { residents as r_dairy } from "#/world/town/residents/dairy"
import { residents as r_breakfast } from "#/world/town/residents/breakfast"
import { residents as r_sweepers } from "#/world/town/residents/sweepers"
import { residents as r_watch } from "#/world/town/residents/watch"
import { residents as r_loggers } from "#/world/town/residents/loggers"
import { residents as r_charcoal } from "#/world/town/residents/charcoal"
import { residents as r_porters } from "#/world/town/residents/porters"
import { residents as r_nanny } from "#/world/town/residents/nanny"
import { residents as r_lodging } from "#/world/town/residents/lodging"
import { residents as r_carpenter } from "#/world/town/residents/carpenter"
import { residents as r_riverfish } from "#/world/town/residents/riverfish"
import { residents as r_elders2 } from "#/world/town/residents/elders2"
import { residents as r_nightstall } from "#/world/town/residents/nightstall"

const LISTED: Resident[] = [
  smith["ギュンター"],
  smith["ペーター"],
  bakers["マルタ"],
  bakers["ハンス"],
  well["リーゼル"],
  greengrocer["アンナ"],
  fruit["クララ"],
  fisher["エルザ"],
  fruit["オットー"],
  greengrocer["グレーテ"],
  fisher["ヤコブ"],
  farm["フリッツ"],
  farm["ミア"],
  elder["ヴィルヘルム"],
  inn["ゲルダ"],
  woodcutter["ヨーゼフ"],
  farm["ウルリケ"],
  farm["カール"],
  shepherd["マティアス"],
  priest["ベネディクト"],
  guards["ディーター"],
  elder["ゾフィー"],
  carter["ベルタ"],
  carter["ルカス"],
  well["ヘレナ"],
  tavern["フランツ"],
  apothecary["イルムガルト"],
  general["ブルーノ"],
  tailor["マグダレーナ"],
  crystal["コンスタンティン"],
  buyer["ラインホルト"],
  armorer["ベアトリクス"],
  woodworker["ゴットフリート"],
  leather["ルドルフ"],
  guards["オイゲン"],
  guide["テオ"],
  warehouse["ヒルデ"],
  bakers["ローザ"],
  inn["ゼップ"],
  inn["ニーナ"],
  farm["ゲルトルート"],
  farm["ヴァルター"],
  priest["クレメンス"],
  fisher["パウル"],
  fisher["レナ"],
  fruit["ヨナス"],
  lamp["アウグスト"],
  lamp["ヘートヴィヒ"],
  lamp["ティム"],
  carter["エミール"],
  mapmaker["フェルディナント"],
  tavern["リリー"],
  tavern["マックス"],
  apothecary["エーファ"],
  tailor["ロッテ"],
  buyer["カスパー"],
  scribe["エーリヒ"],
  scribe["マリー"],
  scribe["ハンナ"],
  candle["アガーテ"],
  candle["ジーモン"],
  candle["フェリックス"],
  armorer["ルイーゼ"],
  woodworker["アントン"],
  potter["ハインリヒ"],
  potter["テレーゼ"],
  potter["アデーレ"],
  baskets["エマ"],
  baskets["ニクラス"],
  baskets["フリーダ"],
  baskets["ローゼマリー"],
  mason["マルクス"],
  mason["カタリーナ"],
  mason["ダニエル"],
  mason["イダ"],
  sweep["ベルンハルト"],
  sweep["モニカ"],
  sweep["トビアス"],
  guards["シュテファン"],
  guards["ヴェロニカ"],
  warehouse["ゲオルク"],
  tinker["クルト"],
  tinker["ザビーネ"],
  tinker["ヨハン"],
  tinker["リナ"],
  hunter["ファルク"],
  hunter["ブリギッテ"],
  hunter["ロルフ"],
  teacher["クリスティアン"],
  teacher["ドロテア"],
  teacher["ラウラ"],
  teacher["ベンヤミン"],
  retired["エドガー"],
  retired["マルグリット"],
  // the households that came with the three shifts
  r_miller["ベルトラム"],
  r_miller["イルゼ"],
  r_miller["クラウス"],
  r_tenant_a["オスカー"],
  r_tenant_a["ヨハンナ"],
  r_tenant_a["ヴァレンティン"],
  r_tenant_a["エリーゼ"],
  r_tenant_b["ヴェンデル"],
  r_tenant_b["アグネス"],
  r_tenant_b["ルートヴィヒ"],
  r_tenant_b["イルマ"],
  r_butcher["アルブレヒト"],
  r_butcher["ギーゼラ"],
  r_butcher["バスティアン"],
  r_dairy["レーニ"],
  r_dairy["フーゴ"],
  r_dairy["ピア"],
  r_breakfast["オッティリエ"],
  r_breakfast["ベンノ"],
  r_breakfast["ユッタ"],
  r_sweepers["グスタフ"],
  r_sweepers["ヴィルマ"],
  r_sweepers["エリアス"],
  r_watch["コンラート"],
  r_watch["ヘンリケ"],
  r_watch["ロータル"],
  r_loggers["アンゼルム"],
  r_loggers["ルーペルト"],
  r_loggers["フロリアン"],
  r_charcoal["ゼヴェリン"],
  r_charcoal["ヴァルトラウト"],
  r_charcoal["ティル"],
  r_porters["インゴ"],
  r_porters["カルラ"],
  r_porters["ベルント"],
  r_nanny["アンネリー"],
  r_nanny["エルナ"],
  r_lodging["ヘルタ"],
  r_lodging["キリアン"],
  r_lodging["ヴィープケ"],
  r_lodging["ネーレ"],
  r_lodging["レオポルト"],
  r_carpenter["フォルカー"],
  r_carpenter["ジビレ"],
  r_carpenter["ウルリヒ"],
  r_carpenter["パウリーネ"],
  r_riverfish["クーノ"],
  r_riverfish["テーダ"],
  r_riverfish["モーリッツ"],
  r_elders2["エルヴィン"],
  r_elders2["アーデルハイト"],
  r_nightstall["ドミニク"],
  r_nightstall["レア"],
  r_nightstall["リヌス"],
  shepherd["レージ"],
]

/** Everyone, with shopkeepers moved behind the counters of the shops you walk into. */
export const RESIDENTS: Resident[] = LISTED.map((r) => {
  const p = keeperPlace(r.name)
  return p ? { ...r, map: p.map, at: [(p.cell[0] + 0.5) / 2, (p.cell[1] + 0.5) / 2] as V2 } : r
})

/** The looks residents are drawn with; their index remains the sprite bake index. */
export const RESIDENT_LOOKS: Look[] = createResidentLooks(RESIDENTS.map((resident) => resident.look))

/** Anims residents play (they stand and look around), baked ahead of time. */
export const RESIDENT_ANIMS: Anim[] = ["idle", "look"]
