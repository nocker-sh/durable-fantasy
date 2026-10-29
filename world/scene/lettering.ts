// What is written in the world: signs, boards and notices. The town writes its own tongue, in
// plain capital letters (Vietnamese without tone marks or other marks, town.md「町の文字」); the
// player's screens stay in Japanese. The letters are drawn in one font, kept here, so the town's
// own alphabet can replace it later in one place.
import type { ShopKind } from "../core/shops.ts"

/** The face the world's letters are drawn in. */
export const LETTER_FONT = '"DotGothic16", sans-serif'

/** Only these may be written in the world: capitals, digits, spaces and a dash. */
export const LETTERS = /^[A-Z0-9 -]+$/

/** Words on boards and notices. */
export const WORDS = {
  /** a shop's board while someone minds the counter (mở cửa) */
  open: "MO CUA",
  /** and while nobody does (đóng cửa) */
  shut: "DONG CUA",
  /** a house to let (cho thuê) */
  toLet: "CHO THUE",
} as const

/** The hanging sign over a shop's door: the trade, short. A shop with none of its own shows its kind. */
export const SHOP_SIGN: Partial<Record<string, string>> = {
  tavern: "QUAN RUOU",
  inn: "NHA TRO",
  smithy: "LO REN",
  woodworker: "THO MOC",
  leather: "DO DA",
  bakery: "BANH MI",
}
export const KIND_SIGN: Record<ShopKind, string> = {
  food: "DO AN",
  inn: "NHA TRO",
  weapon: "VU KHI",
  armor: "AO GIAP",
  tools: "DO DUNG",
  medicine: "THUOC",
  crystal: "TINH THE",
  tailor: "THO MAY",
  buyer: "THU MUA",
}

/** Boards standing out in the fields, line by line. Names of people are written as they are said. */
export const BOARDS = {
  /** Otto's orchard (vườn quả) */
  orchard: ["VUON QUA OTTO"],
  /** Jakob's net shed (lán lưới) */
  netShed: ["LAN LUOI JAKOB"],
  /** Josef's charcoal kilns (lò than) */
  kilns: ["LO THAN JOSEF"],
  /** the crossroads: south to the pass, west to the deep forest, north to Quy Nhon */
  crossroads: ["NAM - DEO", "TAY - RUNG SAU", "BAC - QUY NHON"],
  /** a gate to a city not yet built (đang xây; chưa vào được) */
  unbuilt: ["DANG XAY", "CHUA VAO DUOC"],
} as const satisfies Record<string, readonly string[]>

/**
 * Write lines centred on (cx, cy), as large as `px` and no wider than `width`: a line that will not
 * fit is drawn smaller rather than run off the board.
 */
export function letter(g: CanvasRenderingContext2D, lines: readonly string[], cx: number, cy: number, width: number, px: number) {
  for (const l of lines) if (!LETTERS.test(l)) throw new Error(`not the town's letters: ${l}`)
  let size = px
  for (; size > 6; size--) {
    g.font = `bold ${size}px ${LETTER_FONT}`
    if (Math.max(...lines.map((l) => g.measureText(l).width)) <= width) break
  }
  g.textAlign = "center"
  g.textBaseline = "middle"
  const step = size * 1.15
  lines.forEach((l, i) => g.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * step))
}

/** A short sign split onto two lines at its space when that lets it be written larger. */
export const signLines = (word: string): string[] => (word.includes(" ") && word.length > 6 ? [word.slice(0, word.indexOf(" ")), word.slice(word.indexOf(" ") + 1)] : [word])
