import { lines as armorer } from "./households/armorer"
import { lines as woodworker } from "./households/woodworker"
import { lines as leather } from "./households/leather"
import { lines as potter } from "./households/potter"
import { lines as baskets } from "./households/baskets"
import { lines as mason } from "./households/mason"
import { lines as sweep } from "./households/sweep"
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
}
