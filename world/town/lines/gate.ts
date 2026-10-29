import { lines as guards } from "./households/guards.ts"
import { lines as guide } from "./households/guide.ts"
import { lines as warehouse } from "./households/warehouse.ts"
import { lines as tinker } from "./households/tinker.ts"
import { lines as hunter } from "./households/hunter.ts"
import { lines as teacher } from "./households/teacher.ts"
import { lines as retired } from "./households/retired.ts"
import { lines as watch } from "./households/watch.ts"
import { lines as porters } from "./households/porters.ts"
import type { Line } from "./line.ts"

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
  コンラート: watch["コンラート"],
  ヘンリケ: watch["ヘンリケ"],
  ロータル: watch["ロータル"],
  インゴ: porters["インゴ"],
  カルラ: porters["カルラ"],
  ベルント: porters["ベルント"],
}
