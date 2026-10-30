import { lines as guards } from "./households/guards"
import { lines as guide } from "./households/guide"
import { lines as warehouse } from "./households/warehouse"
import { lines as tinker } from "./households/tinker"
import { lines as hunter } from "./households/hunter"
import { lines as teacher } from "./households/teacher"
import { lines as retired } from "./households/retired"
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
