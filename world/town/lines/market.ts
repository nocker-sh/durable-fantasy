import { lines as tavern } from "./households/tavern.ts"
import { lines as apothecary } from "./households/apothecary.ts"
import { lines as general } from "./households/general.ts"
import { lines as tailor } from "./households/tailor.ts"
import { lines as crystal } from "./households/crystal.ts"
import { lines as buyer } from "./households/buyer.ts"
import { lines as mapmaker } from "./households/mapmaker.ts"
import { lines as scribe } from "./households/scribe.ts"
import { lines as candle } from "./households/candle.ts"
import type { Line } from "./line.ts"

export const LINES: Record<string, readonly Line[]> = {
  フランツ: tavern["フランツ"],
  イルムガルト: apothecary["イルムガルト"],
  ブルーノ: general["ブルーノ"],
  マグダレーナ: tailor["マグダレーナ"],
  コンスタンティン: crystal["コンスタンティン"],
  ラインホルト: buyer["ラインホルト"],
  フェルディナント: mapmaker["フェルディナント"],
  リリー: tavern["リリー"],
  マックス: tavern["マックス"],
  エーファ: apothecary["エーファ"],
  ロッテ: tailor["ロッテ"],
  カスパー: buyer["カスパー"],
  エーリヒ: scribe["エーリヒ"],
  マリー: scribe["マリー"],
  ハンナ: scribe["ハンナ"],
  アガーテ: candle["アガーテ"],
  ジーモン: candle["ジーモン"],
  フェリックス: candle["フェリックス"],
}
