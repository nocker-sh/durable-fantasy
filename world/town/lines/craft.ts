import { lines as armorer } from "./households/armorer.ts";
import { lines as woodworker } from "./households/woodworker.ts";
import { lines as leather } from "./households/leather.ts";
import { lines as potter } from "./households/potter.ts";
import { lines as baskets } from "./households/baskets.ts";
import { lines as mason } from "./households/mason.ts";
import { lines as sweep } from "./households/sweep.ts";
import type { Line } from "./line.ts";

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
};
