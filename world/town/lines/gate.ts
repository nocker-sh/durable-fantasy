import { lines as guards } from "#/world/town/lines/households/guards"
import { lines as guide } from "#/world/town/lines/households/guide"
import { lines as warehouse } from "#/world/town/lines/households/warehouse"
import { lines as tinker } from "#/world/town/lines/households/tinker"
import { lines as hunter } from "#/world/town/lines/households/hunter"
import { lines as teacher } from "#/world/town/lines/households/teacher"
import { lines as retired } from "#/world/town/lines/households/retired"
import type { Line } from "#/world/town/lines/line"

export const LINES: Record<string, readonly Line[]> = {
  ディーター: guards["ディーター"],
  オイゲン: guards["オイゲン"],
  テオ: guide["テオ"],
  ヒルデ: warehouse["ヒルデ"],
  シュテファン: guards["シュテファン"],
  ヴェロニカ: guards["ヴェロニカ"],
  ゲオルク: warehouse["ゲオルク"],
  クルト: tinker["クルト"],
  ザビーネ: tinker["ザビーネ"],
  ヨハン: tinker["ヨハン"],
  リナ: tinker["リナ"],
  ファルク: hunter["ファルク"],
  ブリギッテ: hunter["ブリギッテ"],
  ロルフ: hunter["ロルフ"],
  クリスティアン: teacher["クリスティアン"],
  ドロテア: teacher["ドロテア"],
  ラウラ: teacher["ラウラ"],
  ベンヤミン: teacher["ベンヤミン"],
  エドガー: retired["エドガー"],
  マルグリット: retired["マルグリット"],
}
