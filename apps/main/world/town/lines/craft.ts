import { lines as carpenter } from "#/world/town/lines/households/carpenter"
import { lines as charcoal } from "#/world/town/lines/households/charcoal"
import { lines as loggers } from "#/world/town/lines/households/loggers"
import { lines as armorer } from "#/world/town/lines/households/armorer"
import { lines as woodworker } from "#/world/town/lines/households/woodworker"
import { lines as leather } from "#/world/town/lines/households/leather"
import { lines as potter } from "#/world/town/lines/households/potter"
import { lines as baskets } from "#/world/town/lines/households/baskets"
import { lines as mason } from "#/world/town/lines/households/mason"
import { lines as sweep } from "#/world/town/lines/households/sweep"
import type { Line } from "#/world/town/lines/line"

export const LINES: Record<string, readonly Line[]> = {
  ベアトリクス: armorer["ベアトリクス"],
  ゴットフリート: woodworker["ゴットフリート"],
  ルドルフ: leather["ルドルフ"],
  ルイーゼ: armorer["ルイーゼ"],
  アントン: woodworker["アントン"],
  ハインリヒ: potter["ハインリヒ"],
  テレーゼ: potter["テレーゼ"],
  アデーレ: potter["アデーレ"],
  エマ: baskets["エマ"],
  ニクラス: baskets["ニクラス"],
  フリーダ: baskets["フリーダ"],
  ローゼマリー: baskets["ローゼマリー"],
  マルクス: mason["マルクス"],
  カタリーナ: mason["カタリーナ"],
  ダニエル: mason["ダニエル"],
  イダ: mason["イダ"],
  ベルンハルト: sweep["ベルンハルト"],
  モニカ: sweep["モニカ"],
  トビアス: sweep["トビアス"],
  アンゼルム: loggers["アンゼルム"],
  ルーペルト: loggers["ルーペルト"],
  フロリアン: loggers["フロリアン"],
  ゼヴェリン: charcoal["ゼヴェリン"],
  ヴァルトラウト: charcoal["ヴァルトラウト"],
  ティル: charcoal["ティル"],
  フォルカー: carpenter["フォルカー"],
  ジビレ: carpenter["ジビレ"],
  ウルリヒ: carpenter["ウルリヒ"],
  パウリーネ: carpenter["パウリーネ"],
}
