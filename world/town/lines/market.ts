import { lines as tavern } from "#/world/town/lines/households/tavern"
import { lines as apothecary } from "#/world/town/lines/households/apothecary"
import { lines as general } from "#/world/town/lines/households/general"
import { lines as tailor } from "#/world/town/lines/households/tailor"
import { lines as crystal } from "#/world/town/lines/households/crystal"
import { lines as buyer } from "#/world/town/lines/households/buyer"
import { lines as mapmaker } from "#/world/town/lines/households/mapmaker"
import { lines as scribe } from "#/world/town/lines/households/scribe"
import { lines as candle } from "#/world/town/lines/households/candle"
import type { Line } from "#/world/town/lines/line"

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
